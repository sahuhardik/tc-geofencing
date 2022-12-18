import { Type } from 'class-transformer';
import { Entity, Column } from 'typeorm';
import { CoreEntity } from '../../common/entities/core.entity';

@Entity({ name: 'jobsite' })
export class JobSite extends CoreEntity {
  @Column({ length: 500 })
  identifier: string;

  @Column({ type: 'decimal', default: 0 })
  @Type(() => Number)
  radius: number;

  @Column({ type: 'decimal', default: 0 })
  @Type(() => Number)
  latitude: number;

  @Column({ type: 'decimal', default: 0 })
  @Type(() => Number)
  longitude: number;

  @Column({ type: 'boolean', default: false })
  notifyOnEntry: boolean;

  @Column({ type: 'boolean', default: false })
  notifyOnExit: boolean;

  @Column({ type: 'integer', nullable: true, default: null })
  taskId: null | number;

  @Column({ default: '' })
  createdBy: string;
}
