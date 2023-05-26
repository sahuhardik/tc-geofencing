import { Module, forwardRef } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { CacheModule } from '../cache/cache.module';
import { JobSiteUsersService } from './jobsite-users.service';
import {
  GeofencesController,
  JobSiteUsersController,
} from './jobsite-users.controller';
import { jobSiteUserProviders } from './jobsite-users.providers';
import { JobSitesModule } from '../jobsite/jobsites.module';

@Module({
  controllers: [JobSiteUsersController, GeofencesController],
  imports: [DatabaseModule, forwardRef(() => JobSitesModule), CacheModule],
  providers: [...jobSiteUserProviders, JobSiteUsersService],
  exports: [JobSiteUsersService],
})
export class JobSiteUsersModule {}
