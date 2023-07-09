import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { Controller, Get, Query, UseGuards, Inject } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { TimeCampService } from './timecamp.service';
import { GetTimeCampTasksDto, TimeCampTaskPaginator } from './dto/get-task.dto';
import { GetTimeCampUsersDto } from './dto/get-user.dto';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { IUser } from './types/user.interface';
import { JobSitesService } from 'src/jobsite/jobsites.service';
import { ITcLocation } from './types/types';

@ApiTags('TimeCamp')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('timecamp')
export class TimeCampController {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    private readonly jobsitesService: JobSitesService,
  ) {}

  @Get('tasks')
  async getTimeCampTasks(
    @Query() query: GetTimeCampTasksDto,
  ): Promise<TimeCampTaskPaginator> {
    const timeCampService = new TimeCampService(
      (this.request.user as IUser).token,
    );

    return timeCampService.getTimeCampTasks(query);
  }

  @Get('users')
  async getTimeCampUsers(@Query() query: GetTimeCampUsersDto): Promise<any> {
    const timeCampService = new TimeCampService(
      (this.request.user as IUser).token,
    );

    const users = await timeCampService.getTimeCampUsers();

    return {
      data: users.data.map((user) => ({
        userId: user.user_id,
        userEmail: user.email,
      })),
    };
  }

  @Get('user-entries')
  async getUserEntries(
    @Query() query: { userId: string; startDate?: string; endDate?: string },
  ): Promise<TimeCampTaskPaginator> {
    const timeCampService = new TimeCampService(
      (this.request.user as IUser).token,
    );

    return timeCampService.getUserEntries(
      query.userId,
      query.startDate,
      query.endDate,
    );
  }

  @Get('users-locations')
  async getAccountUsersLocations(): Promise<ITcLocation[]> {
    const timeCampService = new TimeCampService(
      (this.request.user as IUser).token,
    );
    const users = await timeCampService.getTimeCampUsers();

    const userIds = users.data.map((user) => Number(user.user_id));

    const userLocations = timeCampService.getUsersLocations(userIds);

    return userLocations;
  }

  @Get('user-groups-hierarchy')
  async getUserGroupsHierarchy(): Promise<any> {
    const timeCampService = new TimeCampService(
      (this.request.user as IUser).token,
    );

    const groupSet = await timeCampService.getUserGroupsHierarchy(
      (this.request.user as IUser).adminInGroups,
    );
    return Object.values(groupSet);
  }
}
