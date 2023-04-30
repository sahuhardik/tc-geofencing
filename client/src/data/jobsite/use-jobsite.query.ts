import JobSite from '@repositories/jobsite';
import { useQuery } from 'react-query';
import { JobSite as TJobSite, TimeCampEntry } from '@ts-types/generated';
import { API_ENDPOINTS } from '@utils/api/endpoints';

export const fetchJobSite = async (id: string) => {
  const { data } = await JobSite.find(`${API_ENDPOINTS.JOBSITES}/${id}`);
  return data;
};

export const useJobSiteQuery = (id: string) => {
  return useQuery<TJobSite, Error>([API_ENDPOINTS.JOBSITES, id], () => fetchJobSite(id));
};

export const getMemberEntries = async (
  userId: string,
  startDate?: string,
  endDate?: string
): Promise<{ entries: TimeCampEntry[] }> => {
  const { data } = await JobSite.find(
    `${API_ENDPOINTS.MEMBER_TIMESHEET}/?userId=${userId}${startDate ? '&startDate=' + startDate : ''}${
      endDate ? '&endDate=' + endDate : ''
    }`
  );
  return { entries: data?.data ?? [] };
};

export const useJobsiteMemberTimesheet = (userId: string) => {
  return useQuery<{ entries: TimeCampEntry[] }, Error>(
    [API_ENDPOINTS.MEMBER_TIMESHEET, userId],
    () => getMemberEntries(userId),
    {
      enabled: false,
    }
  );
};
