import { OmitType, PartialType } from '@nestjs/swagger';
import { JobSite } from '../entities/jobsite.entity';

export class UpdateJobSiteDto extends PartialType(
  OmitType(JobSite, ['id', 'createdAt', 'updatedAt', 'createdBy']),
) {}
