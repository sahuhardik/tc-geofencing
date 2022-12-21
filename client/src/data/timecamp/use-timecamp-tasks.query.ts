import TimeCamp from '@repositories/timecamp';
import { useQuery } from 'react-query';
import { JobSite as TJobSite } from '@ts-types/generated';
import { API_ENDPOINTS } from '@utils/api/endpoints';

export const getTimeCampTasks = async () => {
  const { data } = await TimeCamp.find(API_ENDPOINTS.TIMECAMP_TASKS);
  return data;
};

export const useTimeCampTaskQuery = () => {
  return useQuery<TJobSite, Error>([API_ENDPOINTS.TIMECAMP_TASKS], () =>
    getTimeCampTasks()
  );
};
