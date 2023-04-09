import Link from 'next/link';
import JobSiteMapWidget from '@components/widgets/jobsite-map-widget';
import styles from './admin.module.css';

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

const StatusCard = () => {
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
          <span className={styles.clockFont}> 6</span>
        </div>
        <div className={`${styles.workStatContent} text-center`}>
          <div className={styles.clockFontMini}>Job Sites</div>
          <span className={styles.clockFont}> 4s</span>
        </div>
      </div>
    </div>
  );
};

export default function Dashboard() {
  return (
    <>
      <div className="w-full bg-white p-5 rounded-lg">
        <JobSiteMapWidget zoom={18} height={'510px'} />
        <div className="flex gap-6 pt-6 flex-wrap">
          <WorkStatCard />
          <WorkStatCard />
          <StatusCard />
        </div>
      </div>
    </>
  );
}
