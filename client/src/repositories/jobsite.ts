import { CreateJobSiteInput, UpdateJobSiteInput } from '@ts-types/generated';
import Base from './base';

class Manufacturer extends Base<CreateJobSiteInput, UpdateJobSiteInput> {}

export default new Manufacturer();
