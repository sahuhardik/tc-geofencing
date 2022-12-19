import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JobSitesService } from './jobsites.service';
import { JobSite } from './entities/jobsite.entity';
import { GetJobSitesDto, JobSitePaginator } from './dto/get-jobsites.dto';
import { CreateJobSiteDto } from './dto/create-jobsite.dto';
import { UpdateJobSiteDto } from './dto/update-jobsite.dto';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';

@ApiTags('JobSites')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('jobsites')
export class JobSitesController {
  constructor(private readonly jobsitesService: JobSitesService) {}

  @Post()
  createProduct(@Body() createJobSiteDto: CreateJobSiteDto) {
    return this.jobsitesService.create(createJobSiteDto);
  }

  @Get()
  async getJobSites(@Query() query: GetJobSitesDto): Promise<JobSitePaginator> {
    return this.jobsitesService.getJobSites(query);
  }

  @Get(':id')
  async getJobSiteById(@Param('id') id: string): Promise<JobSite> {
    return this.jobsitesService.get(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateJobSitesDto: UpdateJobSiteDto) {
    return this.jobsitesService.update(id, updateJobSitesDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.jobsitesService.remove(id);
  }
}
