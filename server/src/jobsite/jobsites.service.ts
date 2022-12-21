import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { FindManyOptions, Like, Repository } from 'typeorm';
import { JobSite } from './entities/jobsite.entity';
import { GetJobSitesDto, JobSitePaginator } from './dto/get-jobsites.dto';
import { paginate } from '../common/pagination/paginate';
import { CreateJobSiteDto } from './dto/create-jobsite.dto';
import { UpdateJobSiteDto } from './dto/update-jobsite.dto';
import { GEOFENCE_REPOSITORIES } from 'src/common/constants';
import { IUser } from 'src/timecamp/types/user.interface';

@Injectable()
export class JobSitesService {
  constructor(
    @Inject(GEOFENCE_REPOSITORIES.JOBSITE_REPOSITORY)
    private jobSiteRepository: Repository<JobSite>,
    @Inject(REQUEST) private readonly request: Request,
  ) {}

  async create(createJobSiteDto: CreateJobSiteDto) {
    const newJobSite = this.jobSiteRepository.create(createJobSiteDto);

    newJobSite.createdBy = (this.request.user as IUser).user_id;

    await this.jobSiteRepository.save(newJobSite);

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
    };

    if (search) {
      options.where = { identifier: Like('%' + search + '%') };
    }

    const [results, total] = await this.jobSiteRepository.findAndCount(options);

    const url = `/jobsites?search=${search}&limit=${limit}&page=${page + 1}`;
    return {
      data: results,
      ...paginate(total, page, limit, results.length, url),
    };
  }

  async get(id: string) {
    const jobSite = await this.jobSiteRepository.findOneBy({ id });
    if (!jobSite) {
      throw new NotFoundException('JobSite not found.');
    }
    return jobSite;
  }

  async update(id: string, updateJobSiteDto: UpdateJobSiteDto) {
    const jobSite = await this.jobSiteRepository.findOneBy({ id });
    if (!jobSite) {
      throw new NotFoundException('JobSite not found.');
    }
    this.jobSiteRepository.merge(jobSite, updateJobSiteDto);
    const results = await this.jobSiteRepository.save(jobSite);
    return results;
  }

  async remove(id: string) {
    await this.jobSiteRepository.delete(id);
    return;
  }
}
