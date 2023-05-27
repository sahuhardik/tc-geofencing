import { JobSite } from '../../jobsite/entities/jobsite.entity';
import { Entity, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { CoreEntity } from '../../common/entities/core.entity';

@Entity({ name: 'jobsite_groups' })
@Unique(['jobsiteId', 'groupId'])
export class JobSiteGroup extends CoreEntity {
  @Column({ nullable: false })
  jobsiteId: string;

  @Column('numeric', { nullable: false })
  groupId: number;

  @ManyToOne(() => JobSite, (jobsite) => jobsite.jobSiteGroups)
  @JoinColumn({ name: 'jobsiteId' })
  jobSite: JobSite;
}
