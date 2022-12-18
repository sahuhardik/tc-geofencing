import { Type } from 'class-transformer';
import {
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

export class CoreEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Type(() => Date)
  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  createdAt: Date;

  @Type(() => Date)
  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
    onUpdate: 'CURRENT_TIMESTAMP(6)',
  })
  updatedAt: Date;
}
