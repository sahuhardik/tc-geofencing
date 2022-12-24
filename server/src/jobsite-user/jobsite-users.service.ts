import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { Injectable, Inject, forwardRef } from '@nestjs/common';
import {
  FindManyOptions,
  FindOptionsWhere,
  Repository,
  SaveOptions,
} from 'typeorm';
import { JobSiteUser } from './entities/jobsite-user.entity';
import { JobSiteUserPaginator } from './dto/get-jobsite-users.dto';
import { CreateJobSiteUserDto } from './dto/create-jobsite-user.dto';
import { GEOFENCE_REPOSITORIES } from '../common/constants';
import { JobSitesService } from '../jobsite/jobsites.service';
import { IUser } from '../timecamp/types/user.interface';
import { TimeCampService } from '../timecamp/timecamp.service';

@Injectable()
export class JobSiteUsersService {
  constructor(
    @Inject(GEOFENCE_REPOSITORIES.JOBSITE_USER_REPOSITORY)
    private jobSiteUserRepository: Repository<JobSiteUser>,
    @Inject(REQUEST) private readonly request: Request,
    @Inject(forwardRef(() => JobSitesService))
    private readonly jobsitesService: JobSitesService,
  ) {}

  async create(
    createJobSiteUserDto: CreateJobSiteUserDto,
    options?: SaveOptions,
  ) {
    await this.jobsitesService.get(createJobSiteUserDto.jobsiteId);

    const timeCampService = new TimeCampService(
      (this.request.user as IUser).token,
    );

    const user = await timeCampService.getUserById(
      String(createJobSiteUserDto.userId),
    );

    const newJobSiteUser =
      this.jobSiteUserRepository.create(createJobSiteUserDto);

    newJobSiteUser.user = user;
    newJobSiteUser.userEmail = user.email;

    await this.jobSiteUserRepository.save(newJobSiteUser, options);
    return newJobSiteUser;
  }

  async getJobSiteUsersById(jobsiteId: string): Promise<JobSiteUser[]> {
    const options: FindManyOptions<JobSiteUser> = {
      where: { jobsiteId },
    };

    const results = await this.jobSiteUserRepository.find(options);

    return results;
  }

  async deleteJobSiteUserById(jobsiteId: string): Promise<void> {
    const options: FindOptionsWhere<JobSiteUser> = {
      jobsiteId,
    };

    await this.jobSiteUserRepository.delete(options);

    return;
  }

  async getJobSiteUsers(): Promise<JobSiteUserPaginator> {
    const options: FindManyOptions<JobSiteUser> = {
      where: { userId: Number((this.request.user as IUser).user_id) },
      relations: { jobSite: true },
    };

    const results = await this.jobSiteUserRepository.find(options);

    return { data: results };
  }
}
