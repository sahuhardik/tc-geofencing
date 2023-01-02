import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JobSiteUsersService } from './jobsite-users.service';
import { CreateJobSiteUserDto } from './dto/create-jobsite-user.dto';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { JobSite } from '../jobsite/entities/jobsite.entity';

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
  async getJobSites(): Promise<{ data: JobSite[] }> {
    return this.jobsiteUsersService.getJobSiteUsers();
  }
}
