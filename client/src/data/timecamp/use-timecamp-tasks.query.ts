import TimeCamp from '@repositories/timecamp';
import { useQuery } from 'react-query';
import { TimeCampTask } from '@ts-types/generated';
import { API_ENDPOINTS } from '@utils/api/endpoints';

export const getTimeCampTasks = async () => {
  const { data } = await TimeCamp.find(API_ENDPOINTS.TIMECAMP_TASKS);
  return data.data;
};

export const useTimeCampTaskQuery = () => {
  return useQuery<TimeCampTask[], Error>([API_ENDPOINTS.TIMECAMP_TASKS], () =>
    getTimeCampTasks()
  );
};
