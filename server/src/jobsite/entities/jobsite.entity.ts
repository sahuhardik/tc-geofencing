import { JobSiteUser } from '../../jobsite-user/entities/jobsite-user.entity';
import { Entity, Column, OneToMany } from 'typeorm';
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

  @Column({ type: 'boolean', default: false })
  notifyOnEntry: boolean;

  @Column({ type: 'boolean', default: false })
  notifyOnExit: boolean;

  @Column({ type: 'integer', nullable: true, default: null })
  taskId: null | number;

  @Column({ default: '' })
  createdBy: string;

  @OneToMany(() => JobSiteUser, (jobSiteUser) => jobSiteUser.jobSite)
  jobSiteUsers: JobSiteUser[];
}
