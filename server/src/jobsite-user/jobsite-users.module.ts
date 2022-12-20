import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { JobSiteUsersService } from './jobsite-users.service';
import {
  GeofencesController,
  JobSiteUsersController,
} from './jobsite-users.controller';
import { jobSiteUserProviders } from './jobsite-users.providers';
import { JobSitesModule } from 'src/jobsite/jobsites.module';

@Module({
  controllers: [JobSiteUsersController, GeofencesController],
  imports: [DatabaseModule, JobSitesModule],
  providers: [...jobSiteUserProviders, JobSiteUsersService],
})
export class JobSiteUsersModule {}
