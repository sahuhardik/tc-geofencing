import { Module } from '@nestjs/common';
import { TimeCampController } from './timecamp.controller';
import { JobSitesModule } from '../jobsite/jobsites.module';

@Module({
  controllers: [TimeCampController],
  imports: [JobSitesModule],
})
export class TimeCampModule {}
