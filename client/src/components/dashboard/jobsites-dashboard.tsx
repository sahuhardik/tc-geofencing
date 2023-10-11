import Link from 'next/link';
import { startOfWeek, endOfWeek, format } from 'date-fns';
import JobSiteMapWidget from '@components/widgets/jobsite-map-widget';
import styles from './jobsites-dashboard.module.css';
import { useJobsitesQuery } from '@data/jobsite/use-jobsites.query';
import ErrorMessage from '@components/ui/error-message';
import Loader from '@components/ui/loader/loader';
import { useTranslation } from 'next-i18next';
import { getMemberEntries } from '@data/jobsite/use-jobsite.query';
import { useEffect, useState } from 'react';
import { JobSite, TimeCampEntry } from '@ts-types/generated';
import { ROUTES } from '@utils/routes';
import { useRouter } from 'next/router';

const WorkStatCard = ({ jobsites }: { jobsites: JobSite[] }) => {
  const [statsData, setStatsData] = useState<Record<string, string | number> | null>(null);

  const getTimeText = (duration: number) => {
    const hours = Math.ceil(duration / 3600);
    return `${hours} h`;
  };

  const getTotalTrackedTimeOfGroup = (timeEntries: TimeCampEntry[]) => {
    return timeEntries.reduce((sum, { duration }) => sum + Number(duration), 0); // it is in seconds
  };

  const initializeStats = async () => {
    if (!statsData && jobsites) {
      const userIds = jobsites
        .map((jobSite) => jobSite.jobSiteUsers)
        .flat()
        .map((jobsiteUser) => jobsiteUser?.userId);
      const currentDate = new Date(); // Get current date
      const startDate = format(startOfWeek(currentDate), 'yyyy-MM-dd'); // Get start date of the week
      const endDate = format(endOfWeek(currentDate), 'yyyy-MM-dd'); // Get end date of the week
      const { entries } = await getMemberEntries(userIds.join(','), startDate, endDate);

      const statsData = {
        totalTimeDuration: 0,
        activeJobsites: 0,
        totalActiveMembers: 0,
        totalMembers: 0,
      };

      statsData.totalTimeDuration = Number(getTotalTrackedTimeOfGroup(entries));

      // considering a jobsite active if a jobsite have atleast one active user
      statsData.activeJobsites = jobsites.filter((jobsite) =>
        jobsite.jobSiteUsers?.find((jobsiteUser) => jobsiteUser.isActive)
      ).length;
      statsData.totalActiveMembers = jobsites
        .map((jobsite) => jobsite.jobSiteUsers?.filter((jobsiteUser) => jobsiteUser.isActive))
        .flat().length;
      statsData.totalMembers = jobsites.map((jobsite) => jobsite.jobSiteUsers).flat().length;
      setStatsData(statsData);
      // setStatsData();
    }
  };

  useEffect(() => {
    initializeStats();
  }, [jobsites.length]);
  return (
    <div className={`flex-1 ${styles.workStatCard}`}>
      <span className={styles.workStatHeading}>Team worked this week:</span>
      <div className={styles.workStatContentWrapper}>
        <div className={styles.workStatContent}>
          <span className={styles.clockFont}>{getTimeText(Number(statsData?.totalTimeDuration))}</span>
          <div className={styles.clockFontMini}>Your team logged time</div>
        </div>
        <div className={styles.workStatContent}>
          <span className={styles.clockFont}>
            {' '}
            &gt;
            {Math.round(
              (Number(statsData?.totalTimeDuration) / 3600 / (5 * (statsData ? +statsData?.totalMembers : 1))) * 100
            ) / 100}{' '}
            h
          </span>
          <div className={styles.clockFontMini}>Average per day per person</div>
        </div>
        <div className={styles.workStatContent}>
          <span className={styles.clockFont}>{Number(statsData?.activeJobsites)} sites</span>
          <div className={styles.clockFontMini}>Active job sites</div>
        </div>
        <div className={styles.workStatContent}>
          <span className={styles.clockFont}>{statsData?.totalActiveMembers}</span>
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

  const router = useRouter();

  useEffect(() => {
    if (data?.jobsites.data && data?.jobsites.data.length === 0) {
      // if there is no jobsites then we will reidirect to jobsties page
      router.push(ROUTES.JOBSITES);
    }
  }, [data?.jobsites.data]);

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
          <WorkStatCard jobsites={jobSites} />
          <StatusCard totalJobSites={jobSites.length} totalActivePeoples={totalActivePeoples} />
        </div>
      </div>
    </>
  );
}
