import { Module, forwardRef } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { JobSitesService } from './jobsites.service';
import { JobSitesController } from './jobsites.controller';
import { jobSiteProviders } from './jobsites.providers';
import { JobSiteUsersModule } from '../jobsite-user/jobsite-users.module';

@Module({
  controllers: [JobSitesController],
  imports: [DatabaseModule, forwardRef(() => JobSiteUsersModule)],
  providers: [...jobSiteProviders, JobSitesService],
  exports: [JobSitesService],
})
export class JobSitesModule {}
