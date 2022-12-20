import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { Injectable, Inject } from '@nestjs/common';
import { FindManyOptions, Repository } from 'typeorm';
import { JobSiteUser } from './entities/jobsite-user.entity';
import {
  GetJobSiteUsersDto,
  JobSiteUserPaginator,
} from './dto/get-jobsite-users.dto';
import { CreateJobSiteUserDto } from './dto/create-jobsite-user.dto';
import { GEOFENCE_REPOSITORIES } from 'src/common/constants';
import { JobSitesService } from 'src/jobsite/jobsites.service';
import { IUser } from 'src/users/user.interface';

@Injectable()
export class JobSiteUsersService {
  constructor(
    @Inject(GEOFENCE_REPOSITORIES.JOBSITE_USER_REPOSITORY)
    private jobSiteRepository: Repository<JobSiteUser>,
    private readonly jobsitesService: JobSitesService,
    @Inject(REQUEST) private readonly request: Request,
  ) {}

  async create(createJobSiteUserDto: CreateJobSiteUserDto) {
    await this.jobsitesService.get(createJobSiteUserDto.jobsiteId);

    const newJobSiteUser = this.jobSiteRepository.create(createJobSiteUserDto);
    await this.jobSiteRepository.save(newJobSiteUser);
    return newJobSiteUser;
  }

  async getJobSiteUsers(): Promise<JobSiteUserPaginator> {
    const options: FindManyOptions<JobSiteUser> = {
      where: { userId: Number((this.request.user as IUser).user_id) },
    };

    const results = await this.jobSiteRepository.find(options);

    return { data: results };
  }
}
