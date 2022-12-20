import { DataSource } from 'typeorm';
import { DATA_SOURCE, GEOFENCE_REPOSITORIES } from 'src/common/constants';
import { JobSiteUser } from './entities/jobsite-user.entity';

export const jobSiteUserProviders = [
  {
    provide: GEOFENCE_REPOSITORIES.JOBSITE_USER_REPOSITORY,
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(JobSiteUser),
    inject: [DATA_SOURCE],
  },
];
