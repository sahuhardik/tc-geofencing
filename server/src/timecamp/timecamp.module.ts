import { Module } from '@nestjs/common';
import { TimeCampController } from './timecamp.controller';

@Module({
  controllers: [TimeCampController],
})
export class TimeCampModule {}
