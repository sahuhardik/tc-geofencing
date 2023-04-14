import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { Controller, Get, Query, UseGuards, Inject } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { TimeCampService } from './timecamp.service';
import { GetTimeCampTasksDto, TimeCampTaskPaginator } from './dto/get-task.dto';
import { GetTimeCampUsersDto } from './dto/get-user.dto';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { IUser } from './types/user.interface';

@ApiTags('TimeCamp')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('timecamp')
export class TimeCampController {
  constructor(@Inject(REQUEST) private readonly request: Request) {}

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

    const users = await timeCampService.getTimeCampUsers(query);

    return {
      data: users.data.map((user) => ({
        userId: user.user_id,
        userEmail: user.email,
      })),
    };
  }

  @Get('user-entries')
  async getUserEntries(
    @Query() query: { userId: string },
  ): Promise<TimeCampTaskPaginator> {
    const timeCampService = new TimeCampService(
      (this.request.user as IUser).token,
    );

    return timeCampService.getUserEntries(query.userId);
  }
}
