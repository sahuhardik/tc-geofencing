import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { JobSitesService } from './jobsites.service';
import { JobSitesController } from './jobsites.controller';
import { jobSiteProviders } from './jobsites.providers';

@Module({
  controllers: [JobSitesController],
  imports: [DatabaseModule],
  providers: [...jobSiteProviders, JobSitesService],
  exports: [JobSitesService],
})
export class JobSitesModule {}
