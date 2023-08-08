import Card from '@components/common/card';
import Layout from '@components/layouts/admin';
import Search from '@components/common/search';
import JobSiteList from '@components/jobsite/jobsite-list';
import JobSiteMapWidget from '@components/widgets/jobsite-map-widget';
import { useEffect, useState } from 'react';

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
import { useMeQuery } from '@data/user/use-me.query';
import dynamic from 'next/dynamic';
import mapImage from '../../assets/MapImage.png';

const tourConfig = [
  {
    selector: '[data-tut="tour_button"]',
    className: styles.tourContainer,
    content: () => (
      <div className={styles.tourContainer} >
        <span className={styles.tourHeading} >How to use job sites?</span>
        <div className={styles.tourTextContainer} >
            <span>1. <span className={styles.boldTourText} >Add</span> Jobsites.</span><br/>
            <span>2. Install <span className={styles.boldTourText} >mobile app</span> to track time automatically on job sites. All users must have the app.</span><br/>
            <span>3. Use <span className={styles.boldTourText} >reporting tools</span> on the menu:</span><br/>
            <div className='pl-[40px]'  >
              <ul>
                <li>* Real time map - see users currently present on the job site.</li>
                <li>* Reports - analyze your team's job site time.</li>
              </ul>
            </div>
            <img className='mt-[20px]' src={mapImage.src} />
        </div>
      </div>
    ),
  },
];

const DynamicTour = dynamic(() => import('reactour'), { ssr: false });

export default function JobSites() {
  const { t } = useTranslation();
  const { data: user } = useMeQuery();
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

  const [isTourOpen, setTourOpen] = useState(false); 
  const [mapCenter, setMapCenter] = useState<ILatLng>();
  const [editJobSite, setEditJobSite] = useState<JobSite>();
  const [openJobsiteModal, setOpenJobsiteModal] = useState<boolean>(false);
  const onModalClose = () => {
    refetch();
    setOpenJobsiteModal(false);
    setEditJobSite(undefined);
  };

  useEffect(() => {
    if (data?.jobsites.data.length === 0) {
      setTourOpen(true);
    }
  }, [data?.jobsites.data]);

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
    <Button size="small" data-tut="tour_button" onClick={() => {
      isTourOpen && setTourOpen(false);
      setOpenJobsiteModal(true);
      }} className="h-9 rounded-3xl">
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
      <DynamicTour
        onRequestClose={() => setTourOpen(false)}
        steps={tourConfig}
        isOpen={isTourOpen}
        rounded={5}
        showNumber={false}
        showButtons={false}
        showNavigation={false}
        accentColor={'#4BB063'}
      />
      <Modal open={openJobsiteModal} onClose={onModalClose}>
        <Card className={classNames(['flex flex-wrap flex-row  py-20 px-24', styles.modalContainer])}>
          <CreateOrUpdateJobSiteForm userId={user?.user_id || ''} initialValues={editJobSite} onCancel={onModalClose} />
        </Card>
      </Modal>
      {jobsites?.length === 0 && filterTerm === '' && (
        <div className="w-full h-[88vh] flex-col flex justify-center items-center">
          <BigMarker />
          <span className={`${styles.emptyCardHeading} mt-5`}>No job sites yet</span>
          <span className={`${styles.emptyCardSubHeading} mt-4`}>
            Set up job sites for your team that automatically start and stop tracking time as they enter or leave.
            <br/>
            <a href='https://help.timecamp.com/help/geofencing' target={'_blank'} className={styles.tinyLink} >How does it work?</a>
          </span>
          <div data-tut="jobsite_tour" className="flex-col flex pt-9 gap-4">
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
            <JobSiteMapWidget center={mapCenter} jobSites={data?.jobsites.data || []} zoom={18} height={'95%'} />
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
