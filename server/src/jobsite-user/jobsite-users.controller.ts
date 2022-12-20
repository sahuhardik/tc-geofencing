import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JobSiteUsersService } from './jobsite-users.service';
import {
  GetJobSiteUsersDto,
  JobSiteUserPaginator,
} from './dto/get-jobsite-users.dto';
import { CreateJobSiteUserDto } from './dto/create-jobsite-user.dto';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';

@ApiTags('JobSite Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('jobsite-users')
export class JobSiteUsersController {
  constructor(private readonly jobsiteUsersService: JobSiteUsersService) {}

  @Post('assign')
  createProduct(@Body() createJobSiteUserDto: CreateJobSiteUserDto) {
    return this.jobsiteUsersService.create(createJobSiteUserDto);
  }
}

@ApiTags('Geofences')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('geofences')
export class GeofencesController {
  constructor(private readonly jobsiteUsersService: JobSiteUsersService) {}

  @Get()
  async getJobSites(): Promise<JobSiteUserPaginator> {
    return this.jobsiteUsersService.getJobSiteUsers();
  }
}
