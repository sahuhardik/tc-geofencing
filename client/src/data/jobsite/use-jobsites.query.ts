import {
  QueryParamsType,
  JobsitesQueryOptionsType,
} from '@ts-types/custom.types';
import { mapPaginatorData } from '@utils/data-mappers';
import { useQuery } from 'react-query';
import JobSite from '@repositories/jobsite';
import { API_ENDPOINTS } from '@utils/api/endpoints';
import { JobSitePaginator } from '@ts-types/generated';

const fetchJobsites = async ({
  queryKey,
}: QueryParamsType): Promise<{ jobsites: JobSitePaginator }> => {
  const [_key, params] = queryKey;

  const {
    page,
    text,
    limit = 15,
    orderBy = 'updated_at',
    sortedBy = 'DESC',
  } = params as JobsitesQueryOptionsType;

  const searchString = text;
  // @ts-ignore
  const queryParams = new URLSearchParams({
    searchJoin: 'and',
    orderBy,
    sortedBy,
    limit: limit.toString(),
    ...(page && { page: page.toString() }),
    ...(Boolean(searchString) && { search: searchString }),
  });
  const url = `${API_ENDPOINTS.JOBSITES}?${queryParams.toString()}`;
  const {
    data: { data, ...rest },
  } = await JobSite.all(url);
  return {
    jobsites: {
      data,
      paginatorInfo: mapPaginatorData({ ...rest }),
    },
  };
};

const useJobsitesQuery = (options: JobsitesQueryOptionsType) => {
  return useQuery<{ jobsites: JobSitePaginator }, Error>(
    [API_ENDPOINTS.JOBSITES, options],
    fetchJobsites,
    {
      keepPreviousData: true,
    }
  );
};

export { useJobsitesQuery, fetchJobsites };
