import { useQuery } from 'react-query';
import _ from 'lodash';
import { JobSiteUser, JobSite as TJobsite, TimeCampEntry } from '@ts-types/generated';
import { API_ENDPOINTS } from '@utils/api/endpoints';
import JobSite from '@repositories/jobsite';
import { getMemberEntries } from '@data/jobsite/use-jobsite.query';

export const getReportEntries = async (
  startDate: string,
  endDate: string,
  jobsiteFilter: string
): Promise<{
  entries: TimeCampEntry[];
  jobsites: TJobsite[];
  jobsiteUsers: JobSiteUser[];
}> => {
  const {
    data: { data: jobsites },
  }: {
    data: {
      data: TJobsite[];
    };
  } = await JobSite.all(`${API_ENDPOINTS.JOBSITES}?withUsersLocation=false`);

  let filteredJobsites = _.cloneDeep(jobsites);

  if (jobsiteFilter) {
    filteredJobsites = jobsites
    .filter((jobsite) => (jobsite.id === jobsiteFilter))
  }

  let jobsiteUsers = filteredJobsites
    .map((jobsite) => jobsite.jobSiteUsers)
    .flat()
    .filter(Boolean) as JobSiteUser[];
  jobsiteUsers = jobsiteUsers.filter(
    (jobsiteUser, i) => jobsiteUsers.findIndex((_jobsiteUser) => jobsiteUser.userId === _jobsiteUser.userId) === i
  );
  const jobsiteUserIds = jobsiteUsers.map((jobsiteUser) => jobsiteUser?.userId).join(',');
  let entries = (
    jobsiteUserIds ? (await getMemberEntries(jobsiteUserIds, startDate, endDate)).entries : []
  ) as TimeCampEntry[];
  const allTasksIds = filteredJobsites.map((jobsite) => String(jobsite.taskId));

  entries = entries.filter((_timeEntries) => allTasksIds.includes(_timeEntries.task_id));
  return { entries: entries, jobsites, jobsiteUsers };
};

export const useReportEntriesQuery = (startDate: string, endDate: string, jobsiteFilter: string) => {
  return useQuery<
    {
      entries: TimeCampEntry[];
      jobsites: TJobsite[];
      jobsiteUsers: JobSiteUser[];
    },
    Error
  >([], () => getReportEntries(startDate, endDate, jobsiteFilter));
};
