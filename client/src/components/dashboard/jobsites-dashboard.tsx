import Link from 'next/link';
import JobSiteMapWidget from '@components/widgets/jobsite-map-widget';
import styles from './jobsites-dashboard.module.css';
import { useJobsitesQuery } from '@data/jobsite/use-jobsites.query';
import ErrorMessage from '@components/ui/error-message';
import Loader from '@components/ui/loader/loader';
import { useTranslation } from 'next-i18next';

const WorkStatCard = () => {
  return (
    <div className={`flex-1 ${styles.workStatCard}`}>
      <span className={styles.workStatHeading}>Team worked this week:</span>
      <div className={styles.workStatContentWrapper}>
        <div className={styles.workStatContent}>
          <span className={styles.clockFont}>248 h</span>
          <div className={styles.clockFontMini}>Your team logged time</div>
        </div>
        <div className={styles.workStatContent}>
          <span className={styles.clockFont}> &gt;8 h</span>
          <div className={styles.clockFontMini}>Average per day per person</div>
        </div>
        <div className={styles.workStatContent}>
          <span className={styles.clockFont}>121 sites</span>
          <div className={styles.clockFontMini}>Active job sites</div>
        </div>
        <div className={styles.workStatContent}>
          <span className={styles.clockFont}>2</span>
          <div className={styles.clockFontMini}>Active people in your team</div>
        </div>
      </div>
    </div>
  );
};

const StatusCard = ({ totalJobSites, totalActivePeoples }: { totalJobSites: number; totalActivePeoples: number }) => {
  return (
    <div className={`flex-1 ${styles.statusCard} `}>
      <div className={styles.statusCardHeadingWrapper}>
        <span>Right Now</span>
        <Link href="/">
          <span className={styles.link}>View</span>
        </Link>
      </div>
      <div className={styles.statusCardContent}>
        <div className={`${styles.workStatContent} text-center`}>
          <div className={styles.clockFontMini}>Active People</div>
          <span className={styles.clockFont}>{totalActivePeoples}</span>
        </div>
        <div className={`${styles.workStatContent} text-center`}>
          <div className={styles.clockFontMini}>Job Sites</div>
          <span className={styles.clockFont}> {totalJobSites}</span>
        </div>
      </div>
    </div>
  );
};

export default function JobSitesDashboard() {
  const { t } = useTranslation();
  const {
    data,
    isLoading: loading,
    error,
  } = useJobsitesQuery({
    limit: 1000,
    page: 1,
  });

  if (loading) return <Loader text={t('common:text-loading')} />;
  if (error) return <ErrorMessage message={error.message} />;
  const jobSites = (data?.jobsites.data ?? []).map((jobsite) => ({
    ...jobsite,
    jobSiteUsers: jobsite.jobSiteUsers?.map((jobsiteUser) => ({
      ...jobsiteUser,
    })),
  }));
  const totalActivePeoples = Object.keys(
    jobSites
      .map((jobsite) => jobsite.jobSiteUsers)
      .flat()
      .reduce((acc, jobsiteUser) => {
        if (jobsiteUser) {
          acc[jobsiteUser.userId] = true;
        }
        return acc;
      }, {} as Record<string, boolean>)
  ).length;

  return (
    <>
      <div className="w-full bg-white p-5 rounded-lg">
        <JobSiteMapWidget jobSites={jobSites} zoom={13} height={'510px'} />
        <div className="flex gap-6 pt-6 flex-wrap">
          <WorkStatCard />
          <WorkStatCard />
          <StatusCard totalJobSites={jobSites.length} totalActivePeoples={totalActivePeoples} />
        </div>
      </div>
    </>
  );
}
