import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { CacheService } from '../cache/cache.service';
import {
  FindManyOptions,
  FindOptionsWhere,
  Repository,
  SaveOptions,
  EntityManager,
  DeleteResult,
} from 'typeorm';
import { JobSiteUser } from './entities/jobsite-user.entity';
import { JobSite } from '../jobsite/entities/jobsite.entity';
import { CreateJobSiteUserDto } from './dto/create-jobsite-user.dto';
import { GEOFENCE_REPOSITORIES } from '../common/constants';
import { JobSitesService } from '../jobsite/jobsites.service';
import { IUser } from '../timecamp/types/user.interface';
import { TimeCampService } from '../timecamp/timecamp.service';
import { CreateJobSiteGroupDto } from './dto/create-jobsite-group.dto';
import { JobSiteGroup } from './entities/jobsite-groups.entity';
import { ITcLocation } from 'src/timecamp/types/types';

@Injectable()
export class JobSiteUsersService {
  constructor(
    @Inject(GEOFENCE_REPOSITORIES.JOBSITE_USER_REPOSITORY)
    private jobSiteUserRepository: Repository<JobSiteUser>,
    @Inject(GEOFENCE_REPOSITORIES.JOBSITE_GROUP_REPOSITORY)
    private jobSiteGroupRepository: Repository<JobSiteGroup>,
    @Inject(REQUEST) private readonly request: Request,
    @Inject(forwardRef(() => JobSitesService))
    private readonly jobsitesService: JobSitesService,
    private readonly cacheService: CacheService,
  ) {}

  async create(
    createJobSiteUserDto: CreateJobSiteUserDto,
    options?: SaveOptions,
  ) {
    const newJobSiteUser =
      this.jobSiteUserRepository.create(createJobSiteUserDto);

    await this.jobSiteUserRepository.save(newJobSiteUser, options);
    return newJobSiteUser;
  }

  async saveJobsiteUsers(
    em: EntityManager,
    createJobSiteUserDtos: CreateJobSiteUserDto[],
  ) {
    const newJobSiteUsers = createJobSiteUserDtos.map((jobSiteUser) =>
      this.jobSiteUserRepository.create(jobSiteUser),
    );
    const savedJobSiteUsers = await em.save(newJobSiteUsers);
    return savedJobSiteUsers;
  }

  async saveJobsiteGroups(
    em: EntityManager,
    createJobSiteGroupDtos: CreateJobSiteGroupDto[],
  ) {
    const newJobSiteGroups = createJobSiteGroupDtos.map((jobSiteGroup) =>
      this.jobSiteGroupRepository.create(jobSiteGroup),
    );
    const savedJobSiteGrooups = await em.save(newJobSiteGroups);
    return savedJobSiteGrooups;
  }

  async getJobSiteUsersById(jobsiteId: string): Promise<JobSiteUser[]> {
    const options: FindManyOptions<JobSiteUser> = {
      where: { jobsiteId },
    };

    const results = await this.jobSiteUserRepository.find(options);

    return this.fillJobsiteUsersWithUsers(results);
  }

  async deleteJobSiteUserByJobsiteId(
    em: EntityManager,
    jobsiteId: string,
  ): Promise<DeleteResult> {
    const options: FindOptionsWhere<JobSiteUser> = {
      jobsiteId,
    };
    return em.delete(JobSiteUser, options);
  }

  async deleteJobSiteGroupByJobsiteId(
    em: EntityManager,
    jobsiteId: string,
  ): Promise<DeleteResult> {
    const options: FindOptionsWhere<JobSiteGroup> = {
      jobsiteId,
    };
    return em.delete(JobSiteGroup, options);
  }

  async getJobsitesOfUser(): Promise<{ data: JobSite[] }> {
    const options: FindManyOptions<JobSiteUser> = {
      where: { userId: Number((this.request.user as IUser).user_id) },
      relations: { jobSite: true },
    };

    const jobsiteUsers = await this.jobSiteUserRepository.find(options);

    return { data: jobsiteUsers.map((res) => ({ ...res.jobSite })) };
  }

  async getJobsiteUserLocations(
    jobsiteUsers: JobSiteUser[],
  ): Promise<ITcLocation[]> {
    const jobsiteUserIds = jobsiteUsers.map(
      (jobsiteUser) => jobsiteUser.userId,
    );
    const apiToken = (this.request.user as IUser).token;
    const timeCampService = new TimeCampService(apiToken);

    return timeCampService.getUsersLocations(jobsiteUserIds);
  }

  async fillJobsiteUsersWithUsers(
    jobsiteUsers: JobSiteUser[],
  ): Promise<JobSiteUser[]> {
    const userIds = jobsiteUsers.map(({ userId }) => userId);
    const users = await this.getUsers(userIds);
    const usersSet = users.reduce((usersSet, user) => {
      usersSet[user.user_id] = user;
      return usersSet;
    }, {} as Record<number, IUser>);
    return jobsiteUsers.map((jobsiteUser) => ({
      ...jobsiteUser,
      userEmail: usersSet[jobsiteUser.userId].email,
      user: usersSet[jobsiteUser.userId],
    }));
  }

  async getUsers(userIds: number[]): Promise<IUser[]> {
    const USER_CACHE_TTL = 6 * 60 * 60; //Cache time 6 hour

    const getUserCacheKey = (userId: number) => `user_${userId}`;
    const cacheUserKeys = userIds.map(getUserCacheKey);
    const cachedUsers = (await this.cacheService.mget(cacheUserKeys))
      .map((userData) => JSON.parse(userData) as IUser)
      .filter(Boolean);
    let tcUsers: IUser | IUser[];
    const userIdsToFetch = userIds.filter(
      (userId) =>
        !cachedUsers.find(
          (cachedUser) => Number(cachedUser.user_id) === Number(userId),
        ),
    );

    if (userIdsToFetch.length) {
      const apiToken = (this.request.user as IUser).token;
      const timeCampService = new TimeCampService(apiToken);
      tcUsers = await timeCampService.getTimeCampUsersByIds(
        userIdsToFetch as unknown as string[],
      );
      if (!Array.isArray(tcUsers)) {
        tcUsers = [tcUsers];
      }
      await Promise.all(
        tcUsers.map((tcUser) =>
          this.cacheService.set(
            getUserCacheKey(+tcUser.user_id),
            JSON.stringify(tcUser),
            USER_CACHE_TTL,
          ),
        ),
      );
    }

    return cachedUsers.concat(tcUsers).filter(Boolean);
  }
}
