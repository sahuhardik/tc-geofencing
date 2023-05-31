import { QueryKey } from 'react-query';
import { SortOrder } from './generated';

export type JobsitesQueryOptionsType = {
  text?: string;
  is_approved?: boolean;
  type?: string;
  page?: number;
  limit?: number;
  orderBy?: string;
  withUsersLocation?: boolean;
  sortedBy?: SortOrder;
};

export type QueryOptionsType = {
  page?: number;
  text?: string;
  shop_id?: number;
  limit?: number;
  orderBy?: string;
  sortedBy?: SortOrder;
};

export type QueryParamsType = {
  queryKey: QueryKey;
  pageParam?: string;
};
