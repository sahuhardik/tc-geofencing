import Card from '@components/common/card';
import Layout from '@components/layouts/admin';
import Search from '@components/common/search';
import JobSiteList from '@components/jobsite/jobsite-list';
import JobSiteMapWidget from '@components/widgets/jobsite-map-widget';
import { useState } from 'react';

import { LIMIT } from '@utils/constants';
import ErrorMessage from '@components/ui/error-message';
import Loader from '@components/ui/loader/loader';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import { GetStaticProps } from 'next';
import { useJobsitesQuery } from '@data/jobsite/use-jobsites.query';
import { JobSite, SortOrder } from '@ts-types/generated';
import { ILatLng } from '@components/widgets/google-map-components';
import Button from '@components/ui/button';
import Modal from '@components/ui/modal/modal';
import CreateOrUpdateJobSiteForm from '@components/jobsite/jobsite-form';
import { PlusIcon } from '@components/icons/plus-icon';
import { DownloadIconOutline } from '@components/icons/download-icon-outline';
import classNames from 'classnames';
import styles from './jobsites.module.css';
import { BigMarker } from '@components/icons/big-marker';

export default function JobSites() {
  const { t } = useTranslation();
  const [filterTerm, setFilterTerm] = useState('');
  const [page, setPage] = useState(1);
  const [orderBy, setOrder] = useState('created_at');
  const [sortedBy, setColumn] = useState<SortOrder>(SortOrder.Desc);
  const {
    data,
    isLoading: loading,
    error,
    refetch,
  } = useJobsitesQuery({
    limit: LIMIT,
    page,
    orderBy,
    sortedBy,
  });

  const [mapCenter, setMapCenter] = useState<ILatLng>();
  const [editJobSite, setEditJobSite] = useState<JobSite>();
  const [openJobsiteModal, setOpenJobsiteModal] = useState<boolean>(false);
  const onModalClose = () => {
    refetch();
    setOpenJobsiteModal(false);
    setEditJobSite(undefined);
  };

  if (loading) return <Loader text={t('common:text-loading')} />;
  if (error) return <ErrorMessage message={error.message} />;

  function handleSearch(e: React.FormEvent<HTMLInputElement>) {
    const searchText = e.currentTarget.value;
    setFilterTerm(searchText?.trim());
  }
  function handlePagination(current: number) {
    setPage(current);
  }

  function handleJobsiteEdit(jobsite: JobSite) {
    setEditJobSite(jobsite);
    setOpenJobsiteModal(true);
  }

  const importJobsiteBtn = (
    <Button type="button" size="small" variant="outline" className="h-9 rounded-3xl">
      &nbsp; <DownloadIconOutline height={27} /> &nbsp; Import job sites&nbsp;&nbsp;&nbsp;
    </Button>
  );
  const addJobsiteBtn = (
    <Button size="small" onClick={() => setOpenJobsiteModal(true)} className="h-9 rounded-3xl">
      &nbsp; <PlusIcon height={27} /> {t('form:button-label-add-jobsite')} &nbsp;&nbsp;&nbsp;
    </Button>
  );

  const jobsites = filterTerm
    ? data?.jobsites.data.filter(
        (jobsite) =>
          jobsite.identifier.toLowerCase().includes(filterTerm.toLowerCase()) ||
          jobsite.address.toLowerCase().includes(filterTerm.toLowerCase())
      )
    : data?.jobsites.data;
  return (
    <>
      <Modal open={openJobsiteModal} onClose={onModalClose}>
        <Card className={classNames(['flex flex-wrap flex-row  py-20 px-24', styles.modalContainer])}>
          <CreateOrUpdateJobSiteForm initialValues={editJobSite} onCancel={onModalClose} />
        </Card>
      </Modal>
      {jobsites?.length === 0 && filterTerm === '' && (
        <div className="w-full h-[88vh] flex-col flex justify-center items-center">
          <BigMarker />
          <span className={`${styles.emptyCardHeading} mt-5`}>No job sites yet</span>
          <span className={`${styles.emptyCardSubHeading} mt-4`}>
            Set up job sites for your team that automatically start and stop tracking time as they enter or leave. See
            where your team is and how long they’ve been on site.
          </span>
          <div className="flex-col flex pt-9 gap-4">
            {addJobsiteBtn}
            {/* {importJobsiteBtn} */}
          </div>
        </div>
      )}
      {(jobsites?.length !== 0 || filterTerm !== '') && (
        <Card className="flex flex-wrap-reverse flex-row mb-8 md:p-4">
          <div className="xl:w-5/12 w-full xl:mb-0 pr-6">
            <Search onChange={handleSearch} className="mb-5" />
            <JobSiteList
              setMapCenter={(center: ILatLng) => setMapCenter(center)}
              jobsites={jobsites}
              onPagination={handlePagination}
              onOrder={setOrder}
              onSort={setColumn}
              onEditJobSite={handleJobsiteEdit}
            />
          </div>
          <div className="xl:w-7/12 w-full mb-4 xl:mb-0 rounded-2xl overflow-hidden">
            <div className="h-[48px] mb-2 flex items-center gap-5 ">
              {/* {importJobsiteBtn} */}
              {addJobsiteBtn}
            </div>
            <JobSiteMapWidget center={mapCenter} jobSites={data?.jobsites.data || []} zoom={18} height={'100%'} />
          </div>
        </Card>
      )}
    </>
  );
}

JobSites.authenticate = {};

JobSites.Layout = Layout;

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale!, ['form', 'common', 'table'])),
  },
});
