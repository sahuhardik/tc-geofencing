import TimeCamp from '@repositories/timecamp';
import { useQuery } from 'react-query';
import { TimeCampUser, TimeCampGroup } from '@ts-types/generated';
import { API_ENDPOINTS } from '@utils/api/endpoints';

export const getTimeCampUsers = async () => {
  const { data } = await TimeCamp.find(API_ENDPOINTS.TIMECAMP_USERS);
  return data.data;
};

export const useTimeCampUserQuery = () => {
  return useQuery<TimeCampUser[], Error>([API_ENDPOINTS.TIMECAMP_USERS], () => getTimeCampUsers());
};

export const getTimeCampGroupHierarchy = async () => {
  const { data } = await TimeCamp.find(API_ENDPOINTS.TIMECAMP_GROUP_HIERARCHY);
  return data;
};

export const useTimeCampGroupHierarchyQuery = () => {
  return useQuery<TimeCampGroup[], Error>([API_ENDPOINTS.TIMECAMP_GROUP_HIERARCHY], () => getTimeCampGroupHierarchy());
};
