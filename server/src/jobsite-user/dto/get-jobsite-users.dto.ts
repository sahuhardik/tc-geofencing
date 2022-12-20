import { JobSiteUser } from '../entities/jobsite-user.entity';

export class JobSiteUserPaginator {
  data: JobSiteUser[];
}

export class GetJobSiteUsersDto {}

export enum QueryJobSiteUsersOrderByColumn {
  CREATED_AT = 'CREATED_AT',
  IDENTIFIER = 'IDENTIFIER',
  UPDATED_AT = 'UPDATED_AT',
}
