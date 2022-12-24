import { NotFoundException } from '@nestjs/common/exceptions';
import { TIMECAMP_HOST_URL } from '../common/constants';
import { createDataTree } from '../utils/create-data-tree';
import FetchAPI from '../utils/Fetcher';
import { GetTimeCampTasksDto, TimeCampTaskPaginator } from './dto/get-task.dto';
import { GetTimeCampUsersDto, TimeCampUserPaginator } from './dto/get-user.dto';
import { ITask } from './types/task.interface';
import { IUser } from './types/user.interface';

export class TimeCampService {
  private readonly timeCampAxios = new FetchAPI(TIMECAMP_HOST_URL);

  constructor(private token: string) {}

  async getUserSettings(): Promise<IUser> {
    const { data } = await this.timeCampAxios.default.get<IUser>(
      '/third_party/api/user/me?format=json',
      {
        headers: {
          Accept: 'application/json',
          'Accept-Encoding': 'gzip,deflate,compress',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.token}`,
        },
      },
    );

    return data;
  }

  async getUserById(id: string): Promise<IUser> {
    const { data } = await this.timeCampAxios.default.get<IUser>(
      `/third_party/api/user/${id}?format=json`,
      {
        headers: {
          Accept: 'application/json',
          'Accept-Encoding': 'gzip,deflate,compress',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.token}`,
        },
      },
    );

    if (!data) {
      throw new NotFoundException('User not found.');
    }

    return data;
  }

  async getTimeCampTasks({
    search,
  }: GetTimeCampTasksDto): Promise<TimeCampTaskPaginator> {
    const { data } = await this.timeCampAxios.default.get<{
      [x: string]: ITask;
    }>('/third_party/api/tasks?format=json', {
      headers: {
        Accept: 'application/json',
        'Accept-Encoding': 'gzip,deflate,compress',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.token}`,
      },
    });

    return { data: createDataTree<ITask>(Object.values(data)) };
  }

  async getTimeCampUsers({
    search,
  }: GetTimeCampUsersDto): Promise<TimeCampUserPaginator> {
    const { data } = await this.timeCampAxios.default.get<IUser[]>(
      '/third_party/api/users?format=json',
      {
        headers: {
          Accept: 'application/json',
          'Accept-Encoding': 'gzip,deflate,compress',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.token}`,
        },
      },
    );

    return { data };
  }
}
