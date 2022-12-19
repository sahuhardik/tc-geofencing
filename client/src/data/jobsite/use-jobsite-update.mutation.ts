import { useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';
import JobSite from '@repositories/jobsite';
import { API_ENDPOINTS } from '@utils/api/endpoints';
import { useTranslation } from 'next-i18next';
import { UpdateJobSiteInput } from '@ts-types/generated';

export interface IJobSiteUpdateVariables {
  variables: {
    input: UpdateJobSiteInput;
  };
}

export const useUpdateJobSiteMutation = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  return useMutation(
    ({ variables: { input } }: IJobSiteUpdateVariables) =>
      JobSite.update(`${API_ENDPOINTS.JOBSITES}/${input?.id}`, input),
    {
      onSuccess: () => {
        toast.success(t('common:successfully-updated'));
      },
      // Always refetch after error or success:
      onSettled: () => {
        queryClient.invalidateQueries(API_ENDPOINTS.JOBSITES);
      },
    }
  );
};
