import Layout from '@components/layouts/admin';
import JobSiteMapWidget from '@components/widgets/jobsite-map-widget';
import 'react-date-range/dist/styles.css'; // main style file
import 'react-date-range/dist/theme/default.css'; // theme css file
import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import ErrorMessage from '@components/ui/error-message';
import Loader from '@components/ui/loader/loader';
import { useJobsitesQuery } from '@data/jobsite/use-jobsites.query';
import { useTranslation } from 'next-i18next';
import Search from '@components/common/search';
import { useEffect, useState } from 'react';
import { JobSite, JobSiteUser } from '@ts-types/generated';
import { Hamburger } from '@components/icons/hamburger';
import styles from './realtime.module.css';
import cn from 'classnames';
import CrossIcon from '@components/icons/cross-icon';
import { JobsiteItem } from '@components/jobsite/jobsite-list';
import { mapMarkerColors } from '@components/widgets/google-map-components';

const RightSidebar = ({ sidebarOpen, children }: { sidebarOpen: boolean; children: React.ReactNode }) => {
  return <div className={cn(styles.sidebar, sidebarOpen && styles.opened)}>{children}</div>;
};

const JobSiteList = ({ jobsites, openedJobsite }: { jobsites: JobSite[]; openedJobsite: string }) => {
  const [searchQuery, setSearchQuery] = useState<string>('');

  function handleSearch(e: React.FormEvent<HTMLInputElement>) {
    const searchText = e.currentTarget.value;
    setSearchQuery(searchText?.trim()?.toLowerCase());
  }

  const filterJobsites = () => {
    const getFilteredUsers = (jobsiteUsers?: JobSiteUser[]) =>
      jobsiteUsers?.filter(
        (jobsiteUser) =>
          jobsiteUser.user.display_name.toLowerCase().includes(searchQuery) ||
          jobsiteUser.userEmail.toLowerCase().includes(searchQuery)
      );
    const isJobsiteSelected = (jobsite: JobSite) =>
      jobsite.identifier.toLowerCase().includes(searchQuery) || jobsite.address.toLowerCase().includes(searchQuery);
    return jobsites
      .map((jobsite) => {
        const filteredUsers = getFilteredUsers(jobsite.jobSiteUsers || []);
        if (filteredUsers?.length || isJobsiteSelected(jobsite)) {
          return {
            ...jobsite,
            jobSiteUsers: filteredUsers,
          };
        } else {
          return null;
        }
      })
      .filter(Boolean) as JobSite[];
  };

  jobsites = filterJobsites();

  return (
    <>
      <Search
        onChange={handleSearch}
        className="mb-5 w-full min-w-[300px] mt-2"
        placeholder="Search sites or people"
        inputClassName="h-[36px]"
      />
      <div className="rounded overflow-hidden mb-6 h-[75vh] overflow-y-scroll">
        {jobsites?.map((jobsite, i) => (
          <JobsiteItem
            open={openedJobsite === jobsite.id || !!searchQuery.length}
            markerColor={mapMarkerColors[i % mapMarkerColors.length]}
            {...jobsite}
            actionCard={<span>{jobsite.jobSiteUsers?.length}</span>}
            key={jobsite.id}
          />
        ))}
      </div>
    </>
  );
};

export default function RealtimeMap() {
  const { t } = useTranslation();
  const {
    data,
    isLoading: loading,
    error,
    refetch,
  } = useJobsitesQuery({
    limit: 1000,
    page: 1,
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openedJobiteInList, setOpenedJobiteInList] = useState<string>('');

  useEffect(() => {
    const mapRefreshPoller = setInterval(refetch, 5000);
    return () => clearInterval(mapRefreshPoller);
  }, []);

  const [searchQuery, setSearchQuery] = useState<string>('');

  const toggleSidebar = () => {
    setSidebarOpen((_isOpened) => !_isOpened);
  };

  function handleSearch(e: React.FormEvent<HTMLInputElement>) {
    const searchText = e.currentTarget.value;
    setSearchQuery(searchText?.trim());
  }

  if (loading) return <Loader text={t('common:text-loading')} />;
  if (error) return <ErrorMessage message={error.message} />;

  let mapJobsites = data?.jobsites.data ?? [];
  let jobsiteUsers = (data?.jobsites.data
    .map((jobsite) => jobsite.jobSiteUsers)
    .flat()
    .filter((jobsiteUser) => jobsiteUser?.lastPosition?.lat) || []) as JobSiteUser[];

  if (searchQuery) {
    mapJobsites = mapJobsites.filter(
      (jobsite) =>
        jobsite.identifier.toLowerCase().includes(searchQuery.toLowerCase()) ||
        jobsite.address.toLowerCase().includes(searchQuery.toLowerCase())
    );
    jobsiteUsers = jobsiteUsers.filter(
      (jobsiteUser) =>
        jobsiteUser.user.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        jobsiteUser.userEmail.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  return (
    <div className="w-full bg-white p-5 rounded-lg">
      <div className="w-full flex flex-row gap-1 flex-wrap">
        <div className="w-2/6"></div>
        <Search
          onChange={handleSearch}
          className="mb-5 w-3/6 min-w-[300px]"
          placeholder="Search address, job site name/email of a person"
          inputClassName="h-[36px]"
        />
        <div
          className="flex flex-row gap-[10px] flex-1 items-center h-[37px] justify-end cursor-pointer"
          onClick={toggleSidebar}
        >
          <Hamburger />
          <span className={styles.lightText}>Show List</span>
        </div>
      </div>
      <JobSiteMapWidget
        key={`${mapJobsites.length}-${jobsiteUsers.length}`}
        jobSites={mapJobsites}
        jobsiteUsers={jobsiteUsers}
        zoom={mapJobsites.length || jobsiteUsers.length ? 11 : 7}
        height={'694px'}
        bypassErrorMessage
        hideJobsiteMembersMarkers
        disableJobsiteMembersMarkers
        onJobsiteClick={(jobsite: JobSite) => {
          setOpenedJobiteInList(jobsite.id);
          setSidebarOpen(true);
        }}
      />
      <RightSidebar sidebarOpen={sidebarOpen}>
        <div style={{ backgroundColor: '#fff', width: '100%' }}>
          <div className={styles.headingContainer}>
            <span className={styles.sidebarHeading}>List of job sites with people</span>
            <span className="cursor-pointer" onClick={toggleSidebar}>
              <CrossIcon />
            </span>
          </div>
          <JobSiteList openedJobsite={openedJobiteInList} jobsites={data?.jobsites.data ?? []} />
        </div>
      </RightSidebar>
    </div>
  );
}

RealtimeMap.authenticate = {};

RealtimeMap.Layout = Layout;

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale!, ['form', 'common', 'table'])),
  },
});
