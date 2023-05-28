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
import { JobSiteUser } from '@ts-types/generated';

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

  useEffect(() => {
    const mapRefreshPoller = setInterval(refetch, 5000);
    return () => clearInterval(mapRefreshPoller);
  }, []);

  const [searchQuery, setSearchQuery] = useState<string>('');

  function handleSearch(e: React.FormEvent<HTMLInputElement>) {
    const searchText = e.currentTarget.value;
    setSearchQuery(searchText?.trim());
  }

  if (loading) return <Loader text={t('common:text-loading')} />;
  if (error) return <ErrorMessage message={error.message} />;

  let mapJobsites = (data?.jobsites.data ?? []).map((jobsite) => ({ ...jobsite, jobSiteUsers: [] }));
  let jobsiteUsers = (data?.jobsites.data.map((jobsite) => jobsite.jobSiteUsers).flat().filter((jobsiteUser) => jobsiteUser?.lastPosition?.lat) || []) as JobSiteUser[];

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
        <div className="w-2/5"></div>
        <Search
          onChange={handleSearch}
          className="mb-5 w-2/5 min-w-[300px]"
          placeholder="Search address, job site name/email of a person"
          inputClassName="h-[36px]"
        />
      </div>
      <JobSiteMapWidget
        key={`${mapJobsites.length}-${jobsiteUsers.length}`}
        jobSites={mapJobsites}
        jobsiteUsers={jobsiteUsers}
        zoom={mapJobsites.length || jobsiteUsers.length ? 11 : 7}
        height={'694px'}
        bypassErrorMessage
      />
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
