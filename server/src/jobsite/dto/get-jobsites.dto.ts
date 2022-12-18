import { SortOrder } from 'src/common/dto/generic-conditions.dto';
import { PaginationArgs } from 'src/common/dto/pagination-args.dto';
import { Paginator } from 'src/common/dto/paginator.dto';
import { JobSite } from '../entities/jobsite.entity';

export class JobSitePaginator extends Paginator<JobSite> {
  data: JobSite[];
}

export class GetJobSitesDto extends PaginationArgs {
  orderBy?: QueryJobSitesOrderByColumn;
  sortedBy?: SortOrder;
  search?: string;
}

export enum QueryJobSitesOrderByColumn {
  CREATED_AT = 'CREATED_AT',
  IDENTIFIER = 'IDENTIFIER',
  UPDATED_AT = 'UPDATED_AT',
}
