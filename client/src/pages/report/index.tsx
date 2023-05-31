import Card from '@components/common/card';
import Layout from '@components/layouts/admin';
import Accordion from '@components/common/accordion';
import cn from 'classnames';
import { ArrowUpPlain } from '@components/icons/arrow-up-plain';
import { SmallMarker } from '@components/icons/small-marker';
import { DateRangePicker } from 'react-date-range';
import { format as dateFormat, endOfDay, endOfWeek, startOfDay, startOfWeek } from 'date-fns';
import { groupBy as groupArrayBy } from '@utils/utils';
import { JobSite, JobSiteUser, TimeCampEntry, TimeCampUser } from '@ts-types/generated';
import Button from '@components/ui/button';
import Modal from '@components/ui/modal/modal';
import styles from './report.module.css';
import { CalendarIcon } from '@components/icons/calendar';
import DropdownMenu from '@components/ui/dropdown-menu';
import { useTranslation } from 'next-i18next';
import { EmptyDataTable } from '@components/icons/empty-data-table';

import 'react-date-range/dist/styles.css'; // main style file
import 'react-date-range/dist/theme/default.css'; // theme css file
import { useReportEntriesQuery } from '@data/timecamp/use-timecamp-report.query';
import { useEffect, useState } from 'react';
import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import ErrorMessage from '@components/ui/error-message';
import Loader from '@components/ui/loader/loader';

enum GROUP_BY {
  DAY = 'day',
  PERSON = 'person',
  JOB_SITE = 'jobsite',
}

interface ITimeEntryGroups {
  groupName: string;
  timeEntries: ReportTimeCampEntry[];
}

interface CalendarDateRange {
  startDate: Date;
  endDate: Date;
  key: string;
}

interface ReportTimeCampEntry extends TimeCampEntry {
  jobsiteName: string;
  jobsiteAddress: string;
  userName: string;
}

const getDateText = (startDate: Date, endDate: Date) => {
  const startDateLabel = dateFormat(startDate, 'dd MMM	yyyy');
  const endDateLabel = dateFormat(endDate, 'dd MMM	yyyy');

  return startDateLabel === endDateLabel ? startDateLabel : `${startDateLabel} - ${endDateLabel}`;
};

const getTimeText = (duration: number) => {
  const hours = Math.floor(duration / 3600);
  const minutes = Math.floor((duration % 3600) / 60);
  const seconds = (duration % 3600) % 60;
  return `${hours}h ${minutes}m ${seconds}s`;
};

const getTotalTrackedTimeOfGroup = (timeEntries: TimeCampEntry[]) => {
  const totalTime = timeEntries.reduce((sum, { duration }) => sum + Number(duration), 0); // it is in seconds
  return getTimeText(totalTime);
};

const DateFilter = ({
  savedCalendarState,
  setSavedCalendarState,
}: {
  savedCalendarState: CalendarDateRange[];
  setSavedCalendarState: Function;
}) => {
  const [isCaledarOpened, setIsCalendarOpened] = useState<boolean>(false);
  const [state, setState] = useState(savedCalendarState);
  const onCalendarDateSelect = () => {
    setSavedCalendarState(state);
    setIsCalendarOpened(false);
  };

  const setToToday = () => {
    const startOfToday = startOfDay(new Date());
    const endOfToday = endOfDay(new Date());
    const _savedCalendarState = JSON.parse(JSON.stringify(savedCalendarState));
    _savedCalendarState[0].startDate = startOfToday;
    _savedCalendarState[0].endDate = endOfToday;

    setSavedCalendarState(_savedCalendarState);
    setState(_savedCalendarState);
  };

  return (
    <div className={styles.calendarContainer}>
      <Modal open={isCaledarOpened} onClose={() => setIsCalendarOpened(false)}>
        <div className="w-full flex flex-col">
          <DateRangePicker
            onChange={(item: any) => {
              setState([item.selection]);
            }}
            moveRangeOnFirstSelection={false}
            months={2}
            ranges={state}
            direction="horizontal"
            rangeColors={['#4BB063']}
          />
          <div className="bg-white gap-2 flex justify-end p-1">
            <Button
              onClick={() => setIsCalendarOpened(false)}
              size="small"
              className="bg-red-600 focus:outline-none hover:bg-red-700 focus:bg-red-700 transition ease-in duration-200"
            >
              Close
            </Button>
            <Button onClick={onCalendarDateSelect} size="small">
              Select
            </Button>
          </div>
        </div>
      </Modal>
      <CalendarIcon />
      <span className={styles.calendarDateText} onClick={() => setIsCalendarOpened(true)}>
        {getDateText(savedCalendarState[0].startDate, savedCalendarState[0].endDate)}
      </span>
      <span className={styles.calendarLinkText} onClick={setToToday}>
        Return to today
      </span>
    </div>
  );
};

const JobsiteFilterBtn = ({
  jobsites,
  selectJobsite,
  value,
}: {
  jobsites: JobSite[];
  selectJobsite: Function;
  value: string;
}) => {
  return (
    <div className={styles.roundedBtnContainer}>
      <SmallMarker />
      <span className={styles.btnText}>
        {value ? jobsites.find((jobsite) => jobsite.id === value)?.identifier : 'Job sites'}
      </span>
      <DropdownMenu
        id={'jobFilterBtn'}
        actionButton={<ArrowUpPlain />}
        menuButtons={[
          {
            label: 'All',
            onClick: () => selectJobsite(null),
          },
          ...jobsites.map((jobsite) => ({
            label: jobsite.identifier,
            onClick: () => selectJobsite(jobsite.id),
          })),
        ]}
      />
    </div>
  );
};

const GroupByBtn = ({ handleGroupByChange, groupBy }: { handleGroupByChange: Function; groupBy: GROUP_BY }) => {
  return (
    <div className="flex flex-row items-center gap-2">
      <span className={styles.dropdownLabel}>Group by: {groupBy}</span>
      <DropdownMenu
        id={'groupbybtn'}
        actionButton={<ArrowUpPlain />}
        menuButtons={[
          {
            label: 'Day',
            onClick: () => handleGroupByChange(GROUP_BY.DAY),
          },
          {
            label: 'Person',
            onClick: () => handleGroupByChange(GROUP_BY.PERSON),
          },
          {
            label: 'Jobsite',
            onClick: () => handleGroupByChange(GROUP_BY.JOB_SITE),
          },
        ]}
      />
    </div>
  );
};

function TableHead() {
  return (
    <div className={styles.tableHeadContainer}>
      <div className={styles.jobsiteContainer}>
        <span className={styles.tableHeadingText}>JOBSITE</span>
      </div>
      <div className={styles.memberContainer}>
        <span className={styles.tableHeadingText}>PERSON</span>
      </div>
      <div className={styles.timeContainer}>
        <span className={styles.tableHeadingText}>ENTRY</span>
      </div>
      <div className={styles.timeContainer}>
        <span className={styles.tableHeadingText}>EXIT</span>
      </div>
      <span className={cn([styles.totalTimeText, styles.tableHeadingText])}>TRACKED TIME</span>
    </div>
  );
}

interface ITimeEntryRowProps {
  jobsiteName: string;
  jobsiteAddress: string;
  userName: string;
  userAvatar: string;
  entryTime: string;
  exitTime: string;
  trackedTime: string;
}

function TimeEntryRow({
  userAvatar,
  trackedTime,
  userName,
  entryTime,
  exitTime,
  jobsiteName,
  jobsiteAddress,
}: ITimeEntryRowProps) {
  const formatTime = (timeString: string) => {
    return dateFormat(new Date(`1970-01-01 ${timeString}`), 'h:mm aaa');
  };
  return (
    <div className={styles.timeEntryRow}>
      <div className={styles.jobsiteContainer}>
        <span className={styles.jobsiteTitle}>{jobsiteName}</span>
        <span className={styles.jobsiteSubTitle}>{jobsiteAddress}</span>
      </div>
      <div className={styles.memberContainer}>
        <img src={userAvatar} className={styles.avatarIcon} />
        <span className={styles.memberName}>{userName}</span>
      </div>
      <div className={styles.timeContainer}>
        <span className={styles.normalText}>{formatTime(entryTime)} </span>
      </div>
      <div className={styles.timeContainer}>
        <span className={styles.normalText}>{formatTime(exitTime)} </span>
      </div>
      <span className={styles.totalTimeText}> {trackedTime}</span>
    </div>
  );
}

interface ITimeEntryGroupProps extends ITimeEntryGroups {
  jobsites: JobSite[];
  timecampUserMap: Record<string, TimeCampUser>;
}

function TimeEntryGroup({ groupName, timeEntries }: ITimeEntryGroupProps) {
  return (
    <Accordion
      key={12}
      headerClasses={styles.groupHeader}
      heading={<span className={styles.groupHeading}>{groupName}</span>}
      actions={<span className={styles.groupHeading}>{getTotalTrackedTimeOfGroup(timeEntries)}</span>}
    >
      {timeEntries.map((timeEntry) => (
        <TimeEntryRow
          jobsiteName={timeEntry.jobsiteName}
          jobsiteAddress={timeEntry.jobsiteAddress}
          userName={timeEntry.userName} //{timecampUserMap[timeEntry?.user_id].display_name || timecampUserMap[timeEntry?.user_id].email}
          entryTime={timeEntry.start_time}
          exitTime={timeEntry.end_time}
          userAvatar={'https://cdn.iconscout.com/icon/free/png-256/free-avatar-370-456322.png?f=webp&w=256'}
          trackedTime={getTimeText(Number(timeEntry.duration))}
        />
      ))}
    </Accordion>
  );
}

export default function Report() {
  const [groupBy, setGroupBy] = useState<GROUP_BY>(GROUP_BY.DAY);
  const [jobsiteFilter, setJobsiteFilter] = useState<string>(null!);
  const [dateFilter, setDateFilter] = useState<CalendarDateRange[]>([
    {
      startDate: startOfWeek(new Date()),
      endDate: endOfWeek(new Date()),
      key: 'selection',
    },
  ]);
  const { t } = useTranslation();
  const {
    data,
    isLoading: loading,
    error,
    refetch,
  } = useReportEntriesQuery(
    dateFormat(dateFilter[0].startDate, 'YYY-MM-dd'),
    dateFormat(dateFilter[0].endDate, 'YYY-MM-dd'),
    jobsiteFilter
  );

  useEffect(() => {
    refetch();
  }, [dateFilter[0].startDate, jobsiteFilter]);

  if (loading) return <Loader text={t('common:text-loading')} />;
  if (error) return <ErrorMessage message={error.message} />;

  const timecampUserMap =
    data?.jobsiteUsers.reduce((timecampUserMap, jobsiteUser) => {
      timecampUserMap[jobsiteUser.userId] = jobsiteUser.user;
      return timecampUserMap;
    }, {} as Record<string, TimeCampUser>) ?? {};

  const getUserJobsite = (userId: string): JobSite => {
    return (data?.jobsites || []).find((jobsite) => {
      return Boolean(jobsite.jobSiteUsers?.find((jobsiteUser) => jobsiteUser.userId === userId));
    }) as JobSite;
  };

  const getTimeEntryGroups = (
    timeEntries: TimeCampEntry[] = [],
    jobsites: JobSite[] = [],
    jobsiteUsers: JobSiteUser[] = []
  ): ITimeEntryGroups[] => {
    const timeEntriesWithJobsite = (timeEntries: TimeCampEntry[], jobsite?: JobSite): ReportTimeCampEntry[] => {
      return timeEntries.map((timeEntry) => {
        const entryJobsite = jobsite ?? getUserJobsite(timeEntry?.user_id);
        return {
          ...timeEntry,
          jobsiteName: entryJobsite.identifier,
          jobsiteAddress: entryJobsite.address,
          userName: timecampUserMap[timeEntry.user_id].display_name || timecampUserMap[timeEntry.user_id].email,
        };
      });
    };

    const timeEntryGroups: ITimeEntryGroups[] = [];
    if (groupBy === GROUP_BY.DAY) {
      const groupedTimeEntriesByDate = groupArrayBy<TimeCampEntry>(timeEntries, 'date');
      Object.entries(groupedTimeEntriesByDate).forEach(([date, _timeEntries]) => {
        timeEntryGroups.push({
          groupName: dateFormat(new Date(date), 'EEEE - d MMMM, yyyy'),
          timeEntries: timeEntriesWithJobsite(_timeEntries),
        });
      });
    } else if (groupBy === GROUP_BY.JOB_SITE) {
      const groupedTimeEntriesByuser = groupArrayBy<TimeCampEntry>(timeEntries, 'user_id');
      console.log(groupedTimeEntriesByuser);
      jobsites.forEach((jobsite: JobSite) => {
        const combinedTimeEntries = jobsite.jobSiteUsers
          ?.map((jobsiteUser) => jobsiteUser.userId)
          .reduce((combinedTimeEntries, userId) => {
            return combinedTimeEntries.concat(groupedTimeEntriesByuser[userId] ?? []);
          }, [] as TimeCampEntry[]);

        timeEntryGroups.push({
          groupName: jobsite.identifier,
          timeEntries: timeEntriesWithJobsite(combinedTimeEntries ?? [], jobsite).filter((_timeEntry) => _timeEntry.task_id === String(jobsite.taskId)),
        });
      });
    } else if (groupBy === GROUP_BY.PERSON) {
      const groupedTimeEntriesByuser = groupArrayBy<TimeCampEntry>(timeEntries, 'user_id');
      jobsiteUsers.forEach((jobsiteUser) => {
        timeEntryGroups.push({
          groupName: jobsiteUser.user.display_name || jobsiteUser.user.email,
          timeEntries: timeEntriesWithJobsite(groupedTimeEntriesByuser[jobsiteUser.userId] ?? []),
        });
      });
    }
    return timeEntryGroups;
  };

  const timeEntryGroups = getTimeEntryGroups(data?.entries, data?.jobsites, data?.jobsiteUsers);

  return (
    <>
      <Card className="flex flex-wrap flex-col items-start mb-8 md:p-4 h-[85vh]">
        <div className="p-4">
          <DateFilter savedCalendarState={dateFilter} setSavedCalendarState={setDateFilter} />
        </div>

        <div className="w-full flex justify-between p-3">
          <JobsiteFilterBtn jobsites={data?.jobsites || []} selectJobsite={setJobsiteFilter} value={jobsiteFilter} />
          <GroupByBtn groupBy={groupBy} handleGroupByChange={setGroupBy} />
        </div>
        <div className={styles.headContainer}>
          <TableHead />
        </div>

        <div className={styles.tableContainer}>
          {timeEntryGroups?.length ? (
            <div className={styles.entriesContainer}>
              {timeEntryGroups?.map((timeEntryGroup, i) => (
                <TimeEntryGroup
                  key={i}
                  jobsites={data?.jobsites ?? []}
                  timecampUserMap={timecampUserMap ?? {}}
                  {...timeEntryGroup}
                />
              ))}
            </div>
          ) : (
            <div className="w-full flex justify-center h-[50vh] flex-col gap-3 items-center">
              <EmptyDataTable />
              <span className={styles.noDataTextHeading}>No data to show</span>
              <span className={styles.noDataTextSubText}>
                There is no data recorded for this time period with selected parameters. Try changing filters.
              </span>
            </div>
          )}
        </div>
        <div className="flex-1 w-full flex justify-end items-end">
          <span className={styles.totalTimeFinalLabel}>Total: </span>
          <span className={styles.totalTimeFinal}>&nbsp; {getTotalTrackedTimeOfGroup(data?.entries ?? [])}</span>
        </div>
      </Card>
    </>
  );
}

Report.authenticate = {};

Report.Layout = Layout;

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale!, ['form', 'common', 'table'])),
  },
});
