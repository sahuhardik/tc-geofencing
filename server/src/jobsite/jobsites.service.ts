import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import {
  Injectable,
  Inject,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { FindManyOptions, Like, Repository } from 'typeorm';
import { JobSite } from './entities/jobsite.entity';
import { GetJobSitesDto, JobSitePaginator } from './dto/get-jobsites.dto';
import { paginate } from '../common/pagination/paginate';
import { CreateJobSiteDto } from './dto/create-jobsite.dto';
import { UpdateJobSiteDto } from './dto/update-jobsite.dto';
import { GEOFENCE_REPOSITORIES } from '../common/constants';
import { IUser } from '../timecamp/types/user.interface';
import { JobSiteUsersService } from '../jobsite-user/jobsite-users.service';
import { CreateJobSiteUserDto } from '../jobsite-user/dto/create-jobsite-user.dto';

@Injectable()
export class JobSitesService {
  constructor(
    @Inject(GEOFENCE_REPOSITORIES.JOBSITE_REPOSITORY)
    private jobSiteRepository: Repository<JobSite>,
    @Inject(REQUEST) private readonly request: Request,
    @Inject(forwardRef(() => JobSiteUsersService))
    private readonly jobsiteUsersService: JobSiteUsersService,
  ) {}

  async create(createJobSiteDto: CreateJobSiteDto) {
    const newJobSite = this.jobSiteRepository.create(createJobSiteDto);

    newJobSite.createdBy = (this.request.user as IUser).user_id;

    const jobSiteUsersPromise: Promise<CreateJobSiteUserDto>[] = [];

    await this.jobSiteRepository.save(newJobSite, { transaction: true });

    createJobSiteDto.jobSiteUsers.forEach((v) => {
      jobSiteUsersPromise.push(
        this.jobsiteUsersService.create(
          {
            userId: v.userId,
            jobsiteId: newJobSite.id,
          },
          { transaction: true },
        ),
      );
    });

    await Promise.all(jobSiteUsersPromise);

    return newJobSite;
  }

  async getJobSites({
    limit,
    page,
    search,
  }: GetJobSitesDto): Promise<JobSitePaginator> {
    if (!page) page = 1;
    if (!limit) limit = 15;
    const skip = (page - 1) * limit;

    const options: FindManyOptions<JobSite> = {
      take: limit,
      skip,
      where: {
        createdBy: (this.request.user as IUser).user_id,
      },
    };

    if (search) {
      options.where = {
        ...options.where,
        identifier: Like('%' + search + '%'),
      };
    }

    const [results, total] = await this.jobSiteRepository.findAndCount(options);

    const url = `/jobsites?search=${search}&limit=${limit}&page=${page + 1}`;
    return {
      data: results,
      ...paginate(total, page, limit, results.length, url),
    };
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

  async update(id: string, updateJobSiteDto: UpdateJobSiteDto) {
    const jobSite = await this.jobSiteRepository.findOneBy({
      id,
      createdBy: (this.request.user as IUser).user_id,
    });
    if (!jobSite) {
      throw new NotFoundException('JobSite not found.');
    }
    const { jobSiteUsers, ...updateInput } = updateJobSiteDto;

    const jobSiteUsersPromise: Promise<CreateJobSiteUserDto>[] = [];

    jobSiteUsers.forEach((v) => {
      jobSiteUsersPromise.push(
        this.jobsiteUsersService.create(
          {
            userId: v.userId,
            jobsiteId: id,
          },
          { transaction: true },
        ),
      );
    });

    this.jobSiteRepository.merge(jobSite, updateInput);

    const results = await this.jobSiteRepository.save(jobSite, {
      transaction: true,
    });

    await this.jobsiteUsersService.deleteJobSiteUserById(id);

    await Promise.all(jobSiteUsersPromise);

    return results;
  }

  async remove(id: string) {
    const jobSite = await this.jobSiteRepository.findOneBy({
      id,
      createdBy: (this.request.user as IUser).user_id,
    });
    if (!jobSite) {
      throw new NotFoundException('JobSite not found.');
    }

    await this.jobSiteRepository.delete(id);
    return;
  }
}
