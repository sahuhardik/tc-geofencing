import { DataSource } from 'typeorm';
import { DATA_SOURCE, GEOFENCE_REPOSITORIES } from 'src/common/constants';
import { JobSite } from './entities/jobsite.entity';

export const jobSiteProviders = [
  {
    provide: GEOFENCE_REPOSITORIES.JOBSITE_REPOSITORY,
    useFactory: (dataSource: DataSource) => dataSource.getRepository(JobSite),
    inject: [DATA_SOURCE],
  },
];
