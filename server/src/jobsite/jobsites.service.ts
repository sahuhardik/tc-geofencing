import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import {
  Injectable,
  Inject,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { FindManyOptions, Like, Repository, IsNull, DataSource } from 'typeorm';
import _ from 'lodash';
import { DATA_SOURCE } from '../common/constants';
import { JobSite } from './entities/jobsite.entity';
import { GetJobSitesDto, JobSitePaginator } from './dto/get-jobsites.dto';
import { paginate } from '../common/pagination/paginate';
import { CreateJobSiteDto } from './dto/create-jobsite.dto';
import { UpdateJobSiteDto } from './dto/update-jobsite.dto';
import { GEOFENCE_REPOSITORIES } from '../common/constants';
import { IUser } from '../timecamp/types/user.interface';
import { JobSiteUsersService } from '../jobsite-user/jobsite-users.service';
import { calculateCoordinateDistance } from '../utils/maps';
import { TimeCampService } from 'src/timecamp/timecamp.service';
import { IUserGroupNode } from 'src/timecamp/types/types';
import { CacheService } from 'src/cache/cache.service';

@Injectable()
export class JobSitesService {
  constructor(
    @Inject(GEOFENCE_REPOSITORIES.JOBSITE_REPOSITORY)
    private jobSiteRepository: Repository<JobSite>,
    @Inject(REQUEST) private readonly request: Request,
    @Inject(forwardRef(() => JobSiteUsersService))
    private readonly jobsiteUsersService: JobSiteUsersService,
    @Inject(DATA_SOURCE)
    private readonly dataSource: DataSource,
    private readonly cacheService: CacheService,
  ) {}

  async create(createJobSiteDto: CreateJobSiteDto) {
    const saveResult = await this.dataSource.transaction(async (em) => {
      const newJobSite = this.jobSiteRepository.create(createJobSiteDto);
      newJobSite.createdBy = (this.request.user as IUser).user_id;
      newJobSite.rootGroupId = (this.request.user as IUser).root_group_id;
      await em.save(newJobSite);
      await this.jobsiteUsersService.saveJobsiteUsers(
        em,
        createJobSiteDto.jobSiteUsers.map((jobsiteUser) => ({
          ...jobsiteUser,
          jobsiteId: newJobSite.id,
        })),
      );
      await this.jobsiteUsersService.saveJobsiteGroups(
        em,
        createJobSiteDto.jobSiteGroups.map((jobsiteGroup) => ({
          ...jobsiteGroup,
          jobsiteId: newJobSite.id,
        })),
      );
      return newJobSite;
    });

    return saveResult;
  }

  async update(id: string, updateJobSiteDto: UpdateJobSiteDto) {
    const {
      token: apiToken,
      adminInGroups,
      user_id: userId,
    } = this.request.user as IUser;
    const timeCampService = new TimeCampService(apiToken);
    const userGroups = await timeCampService.getUserGroupsHierarchy(
      adminInGroups,
    );

    const groupUsersIds: string[] = [];
    const groupIds: string[] = [];

    const collectUserIds = (group: IUserGroupNode) => {
      groupIds.push(group.group_id);
      group.users.forEach(({ user_id }) => {
        groupUsersIds.push(user_id);
      });
      group.childrens.forEach((subGroup) => collectUserIds(subGroup));
    };

    Object.values(userGroups).map((userGroup) => collectUserIds(userGroup));

    const jobSite = await this.jobSiteRepository.findOneBy({
      id,
      rootGroupId: (this.request.user as IUser).root_group_id,
    });
    if (!jobSite) {
      throw new NotFoundException('JobSite not found.');
    }
    const { jobSiteUsers, jobSiteGroups, ...updateInput } = updateJobSiteDto;

    const updateResult = await this.dataSource.transaction(async (em) => {
      await Promise.all([
        this.jobsiteUsersService.deleteJobSiteGroupByJobsiteId(
          em,
          jobSite.id,
          groupIds,
        ),

        this.jobsiteUsersService.deleteJobSiteUserByJobsiteId(
          em,
          jobSite.id,
          groupUsersIds,
        ),
      ]);

      await Promise.all([
        this.jobsiteUsersService.saveJobsiteUsers(
          em,
          _.uniqBy(jobSiteUsers, 'userId').map((jobsiteUser) => ({
            ...jobsiteUser,
            jobsiteId: jobSite.id,
          })),
        ),
        await this.jobsiteUsersService.saveJobsiteGroups(
          em,
          _.uniqBy(jobSiteGroups, 'groupId').map((jobsiteGroup) => ({
            ...jobsiteGroup,
            jobsiteId: jobSite.id,
          })),
        ),
      ]);

      if (jobSite.createdBy === userId) {
        await this.jobSiteRepository.merge(jobSite, updateInput);
      }
      return em.save(jobSite);
    });

    return updateResult;
  }

  async getJobSites({
    limit,
    page,
    search,
    withUsersLocation,
  }: GetJobSitesDto): Promise<JobSitePaginator> {
    if (!page) page = 1;
    if (!limit) limit = 200;
    const skip = (page - 1) * limit;
    const url = `/jobsites?search=${search}&limit=${limit}&page=${page + 1}`;
    const { root_group_id, token, adminInGroups } = this.request.user as IUser;
    const options: FindManyOptions<JobSite> = {
      take: limit,
      skip,
      where: {
        rootGroupId: root_group_id,
        whenDeleted: IsNull(),
      },
      relations: {
        jobSiteUsers: true,
        jobSiteGroups: true,
      },
    };

    if (search) {
      options.where = {
        ...options.where,
        identifier: Like('%' + search + '%'),
      };
    }

    // eslint-disable-next-line prefer-const
    let [jobsites, total] = await this.jobSiteRepository.findAndCount(options);

    let accessibleUserIds: string[] = [];
    const cachedAccessibleUsers = await this.cacheService.get(
      `accessible_user_for_${token}`,
    );
    if (cachedAccessibleUsers) {
      accessibleUserIds = JSON.parse(cachedAccessibleUsers);
    } else {
      const timeCampService = new TimeCampService(token);
      accessibleUserIds = await timeCampService.getAccessibleUserIds(
        adminInGroups,
      );
      this.cacheService.set(
        `accessible_user_for_${token}`,
        JSON.stringify(accessibleUserIds),
        6 * 60 * 60,
      );
    }

    jobsites = jobsites.map((jobsite) => {
      jobsite.jobSiteUsers = jobsite.jobSiteUsers.filter((jobsiteUser) =>
        accessibleUserIds.find(
          (accessibleUserId) => accessibleUserId === String(jobsiteUser.userId),
        ),
      );
      return jobsite;
    });
    if (withUsersLocation === 'true') {
      try {
        jobsites = await this.populateLocationInJobsiteUsers(jobsites);
      } catch (e) {
        //TODO: need to remove this try-catch once location api starts giving reponse to supervisior as well
      }
    }
    await Promise.all(
      jobsites.map(async (jobsite) => {
        jobsite.jobSiteUsers =
          await this.jobsiteUsersService.fillJobsiteUsersWithUsers(
            jobsite.jobSiteUsers,
          );
        return jobsite;
      }),
    );
    return {
      data: jobsites,
      ...paginate(total, page, limit, jobsites.length, url),
    };
  }

  async populateLocationInJobsiteUsers(
    jobsites: JobSite[],
  ): Promise<JobSite[]> {
    const allJobsiteUsers = jobsites
      .map((jobsite) => jobsite.jobSiteUsers)
      .flat();

    const jobsiteUsersLocations =
      await this.jobsiteUsersService.getJobsiteUserLocations(allJobsiteUsers);

    return jobsites.map((jobsite) => ({
      ...jobsite,
      jobSiteUsers: jobsite.jobSiteUsers.map((jobSiteUser) => {
        const location = jobsiteUsersLocations.find(
          (location) => String(location.user_id) === String(jobSiteUser.userId),
        );
        const lastPosition = {
          lat: +location.latitude,
          lng: +location.longitude,
        };
        return {
          ...jobSiteUser,
          lastPosition,
          isActive:
            jobsite.radius >=
            calculateCoordinateDistance(
              lastPosition?.lat,
              lastPosition?.lng,
              jobsite.latitude,
              jobsite.longitude,
            ),
        };
      }),
    }));
  }

  async get(id: string) {
    const jobSite = await this.jobSiteRepository.findOne({
      where: {
        id,
        createdBy: (this.request.user as IUser).user_id,
      },
      relations: {
        jobSiteUsers: true,
      },
    });
    if (!jobSite) {
      throw new NotFoundException('JobSite not found.');
    }
    return jobSite;
  }

  async remove(id: string) {
    const jobSite = await this.jobSiteRepository.findOneBy({
      id,
      createdBy: (this.request.user as IUser).user_id,
    });
    if (!jobSite) {
      throw new NotFoundException('JobSite not found.');
    }

    await this.jobSiteRepository.update(
      {
        id,
      },
      {
        whenDeleted: new Date(),
      },
    );
    return;
  }
}
