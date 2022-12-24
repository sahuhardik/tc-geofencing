import { OmitType } from '@nestjs/swagger';
import { JobSiteUser } from '../entities/jobsite-user.entity';

export class CreateJobSiteUserDto extends OmitType(JobSiteUser, [
  'id',
  'jobSite',
  'user',
  'userEmail',
  'createdAt',
  'updatedAt',
]) {
  jobSiteUsers?: JobSiteUser[];
}
