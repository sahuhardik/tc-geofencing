import { JobSite } from '../../jobsite/entities/jobsite.entity';
import { IUser } from '../../timecamp/types/user.interface';
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { CoreEntity } from '../../common/entities/core.entity';

@Entity({ name: 'jobsite_users' })
export class JobSiteUser extends CoreEntity {
  @Column({ nullable: false })
  jobsiteId: string;

  @Column('numeric', { nullable: false })
  userId: number;

  @Column({ nullable: false })
  userEmail: string;

  @Column('json', { nullable: false })
  user: IUser;

  @ManyToOne(() => JobSite, (jobsite) => jobsite.jobSiteUsers)
  @JoinColumn({ name: 'jobsiteId' })
  jobSite: JobSite;
}
