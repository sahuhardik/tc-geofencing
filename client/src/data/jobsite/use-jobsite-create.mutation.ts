import { CreateJobSiteInput } from '@ts-types/generated';
import JobSite from '@repositories/jobsite';
import { useMutation } from 'react-query';
import { API_ENDPOINTS } from '@utils/api/endpoints';

export interface IJobsiteCreateVariables {
  variables: { input: CreateJobSiteInput };
}

export const useCreateJobSiteMutation = (onComplete: () => void) => {
  return useMutation(
    ({ variables: { input } }: IJobsiteCreateVariables) => JobSite.create(API_ENDPOINTS.JOBSITES, input),
    {
      onSuccess: onComplete,
      // Always refetch after error or success:
      onSettled: onComplete,
    }
  );
};
