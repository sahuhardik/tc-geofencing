import { OmitType } from '@nestjs/swagger';
import { JobSiteGroup } from '../entities/jobsite-groups.entity';

export class CreateJobSiteGroupDto extends OmitType(JobSiteGroup, [
  'id',
  'jobSite',
  'createdAt',
  'updatedAt',
]) {
  jobSiteUsers?: JobSiteGroup[];
}
