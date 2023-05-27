import { DataSource } from 'typeorm';
import { DATA_SOURCE, GEOFENCE_REPOSITORIES } from '../common/constants';
import { JobSiteGroup } from './entities/jobsite-groups.entity';

export const jobSiteGroupProviders = [
  {
    provide: GEOFENCE_REPOSITORIES.JOBSITE_GROUP_REPOSITORY,
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(JobSiteGroup),
    inject: [DATA_SOURCE],
  },
];
