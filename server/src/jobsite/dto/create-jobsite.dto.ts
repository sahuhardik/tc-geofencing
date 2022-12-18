import { OmitType } from '@nestjs/swagger';
import { JobSite } from '../entities/jobsite.entity';

export class CreateJobSiteDto extends OmitType(JobSite, [
  'id',
  'radius',
  'latitude',
  'longitude',
  'notifyOnEntry',
  'notifyOnExit',
  'taskId',
  'createdBy',
  'createdAt',
  'updatedAt',
]) {}
