import TimeCamp from '@repositories/timecamp';
import { useQuery } from 'react-query';
import { JobSiteUser, JobSite as TJobsite, TimeCampEntry } from '@ts-types/generated';
import { API_ENDPOINTS } from '@utils/api/endpoints';
import JobSite from '@repositories/jobsite';
import { fetchJobsites } from '@data/jobsite/use-jobsites.query';
import { getMemberEntries } from '@data/jobsite/use-jobsite.query';

export const getReportEntries = async (
  startDate: string,
  endDate: string,
  jobsiteFilter: string,
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
  } = await JobSite.all(API_ENDPOINTS.JOBSITES);
  let jobsiteUsers = jobsites
    .filter((jobsite) => jobsiteFilter ? jobsite.id === jobsiteFilter : true )
    .map((jobsite) => jobsite.jobSiteUsers)
    .flat()
    .filter(Boolean) as JobSiteUser[];
  jobsiteUsers = jobsiteUsers.filter(
    (jobsiteUser, i) => jobsiteUsers.findIndex((_jobsiteUser) => jobsiteUser.userId === _jobsiteUser.userId) === i
  );
  const jobsiteUserIds = jobsiteUsers.map((jobsiteUser) => jobsiteUser?.userId).join(',');
  const entries = (
    jobsiteUserIds ? (await getMemberEntries(jobsiteUserIds, startDate, endDate)).entries : []
  ) as TimeCampEntry[];
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
