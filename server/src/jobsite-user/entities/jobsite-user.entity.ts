import { Entity, Column } from 'typeorm';
import { CoreEntity } from '../../common/entities/core.entity';

@Entity({ name: 'jobsite_users' })
export class JobSiteUser extends CoreEntity {
  @Column({ nullable: false })
  jobsiteId: string;

  @Column('numeric', { nullable: false })
  userId: number;
}
