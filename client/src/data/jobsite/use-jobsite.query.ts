import JobSite from '@repositories/jobsite';
import { useQuery } from 'react-query';
import { JobSite as TJobSite } from '@ts-types/generated';
import { API_ENDPOINTS } from '@utils/api/endpoints';

export const fetchJobSite = async (id: string) => {
  const { data } = await JobSite.find(`${API_ENDPOINTS.JOBSITES}/${id}`);
  return data;
};

export const useJobSiteQuery = (id: string) => {
  return useQuery<TJobSite, Error>([API_ENDPOINTS.JOBSITES, id], () => fetchJobSite(id));
};
