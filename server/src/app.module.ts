import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CommonModule } from './common/common.module';
import { AuthModule } from './auth/auth.module';
import { JobSitesModule } from './jobsite/jobsites.module';
import { JobSiteUsersModule } from './jobsite-user/jobsite-users.module';
import { TimeCampModule } from './timecamp/timecamp.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    AuthModule,
    CommonModule,
    JobSitesModule,
    JobSiteUsersModule,
    TimeCampModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
