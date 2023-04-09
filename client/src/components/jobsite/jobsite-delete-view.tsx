import ConfirmationCard from '@components/common/confirmation-card';
import { useModalAction, useModalState } from '@components/ui/modal/modal.context';
import { useDeleteJobSiteMutation } from '@data/jobsite/use-jobsite-delete.mutation';

const JobSiteDeleteView = () => {
  const { mutate: deleteJobSiteMutation, isLoading: loading } = useDeleteJobSiteMutation();

  const { data: modalData } = useModalState();
  const { closeModal } = useModalAction();
  function handleDelete() {
    deleteJobSiteMutation(modalData as string);
    closeModal();
  }
  return <ConfirmationCard onCancel={closeModal} onDelete={handleDelete} deleteBtnLoading={loading} />;
};

export default JobSiteDeleteView;
