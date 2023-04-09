import { useMutation, useQueryClient } from 'react-query';
import JobSite from '@repositories/jobsite';
import { API_ENDPOINTS } from '@utils/api/endpoints';

export const useDeleteJobSiteMutation = () => {
  const queryClient = useQueryClient();

  return useMutation((id: string) => JobSite.delete(`${API_ENDPOINTS.JOBSITES}/${id}`), {
    // Always refetch after error or success:
    onSettled: () => {
      queryClient.invalidateQueries(API_ENDPOINTS.JOBSITES);
    },
  });
};
