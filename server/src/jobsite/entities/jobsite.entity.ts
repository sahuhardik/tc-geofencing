import { JobSiteUser } from '../../jobsite-user/entities/jobsite-user.entity';
import { JobSiteGroup } from '../../jobsite-user/entities/jobsite-groups.entity';
import { Entity, Column, OneToMany, JoinColumn } from 'typeorm';
import { CoreEntity } from '../../common/entities/core.entity';

/// ColumnNumericTransformer
export class ColumnNumericTransformer {
  to(data: number): number {
    return data;
  }
  from(data: string): number {
    return parseFloat(data);
  }
}

@Entity({ name: 'jobsites' })
export class JobSite extends CoreEntity {
  @Column({ length: 500 })
  identifier: string;

  @Column('numeric', {
    precision: 7,
    scale: 2,
    transformer: new ColumnNumericTransformer(),
  })
  radius: number;

  @Column('double', {
    precision: 30,
    scale: 20,
    transformer: new ColumnNumericTransformer(),
  })
  latitude: number;

  @Column('double', {
    precision: 30,
    scale: 20,
    transformer: new ColumnNumericTransformer(),
  })
  longitude: number;

  @Column({ length: 500, default: '' })
  address: string;

  @Column({ type: 'boolean', default: false })
  notifyOnEntry: boolean;

  @Column({ type: 'boolean', default: false })
  notifyOnExit: boolean;

  @Column({ type: 'boolean', default: false })
  pushNotification: boolean;

  @Column({ type: 'integer', nullable: true, default: null })
  taskId: null | number;

  @Column({ default: '' })
  createdBy: string;

  @Column({ type: 'datetime', default: null })
  whenDeleted: Date;

  @OneToMany(() => JobSiteUser, (jobSiteUser) => jobSiteUser.jobSite)
  @JoinColumn()
  jobSiteUsers: JobSiteUser[];

  @OneToMany(() => JobSiteGroup, (jobSiteGroup) => jobSiteGroup.jobSite)
  @JoinColumn()
  jobSiteGroups: JobSiteGroup[];
}
