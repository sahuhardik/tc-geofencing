import { CreateJobSiteInput, UpdateJobSiteInput } from '@ts-types/generated';
import Base from './base';

class JobSite extends Base<CreateJobSiteInput, UpdateJobSiteInput> {}

export default new JobSite();
