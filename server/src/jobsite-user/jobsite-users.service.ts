import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { JobSiteUser } from './entities/jobsite-user.entity';
import { JobSiteUserPaginator } from './dto/get-jobsite-users.dto';
import { CreateJobSiteUserDto } from './dto/create-jobsite-user.dto';
import { GEOFENCE_REPOSITORIES } from 'src/common/constants';
import { JobSitesService } from 'src/jobsite/jobsites.service';
import { IUser } from 'src/timecamp/types/user.interface';

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
    const results = await this.jobSiteRepository
      .createQueryBuilder('jobsite_users')
      .leftJoinAndSelect('jobsite_users.jobsiteId', 'jobsites')
      .where(`jobsite_users.userId = :userId`, {
        userId: Number((this.request.user as IUser).user_id),
      })
      .getMany();

    return { data: results };
  }
}
