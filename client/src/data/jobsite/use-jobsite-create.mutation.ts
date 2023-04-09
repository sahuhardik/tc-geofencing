import { CreateJobSiteInput } from '@ts-types/generated';
import { ROUTES } from '@utils/routes';
import JobSite from '@repositories/jobsite';
import { useRouter } from 'next/router';
import { useMutation, useQueryClient } from 'react-query';
import { API_ENDPOINTS } from '@utils/api/endpoints';

export interface IJobsiteCreateVariables {
  variables: { input: CreateJobSiteInput };
}

export const useCreateJobSiteMutation = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  return useMutation(
    ({ variables: { input } }: IJobsiteCreateVariables) => JobSite.create(API_ENDPOINTS.JOBSITES, input),
    {
      onSuccess: () => {
        router.push(ROUTES.JOBSITES);
      },
      // Always refetch after error or success:
      onSettled: () => {
        queryClient.invalidateQueries(API_ENDPOINTS.JOBSITES);
      },
    }
  );
};
