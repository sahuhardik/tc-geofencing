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

  const jobsites =
    (searchQuery
      ? data?.jobsites.data.filter(
          (jobsite) =>
            jobsite.identifier.toLowerCase().includes(searchQuery.toLowerCase()) ||
            jobsite.address.toLowerCase().includes(searchQuery.toLowerCase()) || 
            jobsite.jobSiteUsers?.filter((jobsiteUser) => jobsiteUser.user.display_name.toLowerCase().includes(searchQuery.toLowerCase())).length
        )
      : data?.jobsites.data) ?? [];

  if (loading) return <Loader text={t('common:text-loading')} />;
  if (error) return <ErrorMessage message={error.message} />;

  return (
    <div className="w-full bg-white p-5 rounded-lg">
      <div className="w-full flex flex-row gap-1 flex-wrap">
        <div className="w-2/5"></div>
        <Search
          onChange={handleSearch}
          className="mb-5 w-2/5 min-w-[300px]"
          placeholder="Search address, job site name or a person"
          inputClassName="h-[36px]"
        />
      </div>
      <JobSiteMapWidget key={`${jobsites.length}`}  jobSites={jobsites} zoom={13} height={'694px'} />
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
