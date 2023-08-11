import { Injectable } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common/exceptions';
import { CacheService } from '../cache/cache.service';
import {
  buildGroupHierarchy,
  filterGroupsWithAccesses,
  getUsersFromGroupSets,
} from 'src/utils/groups';
import { TIMECAMP_HOST_URL, LOCATION_SERVICE_URL } from '../common/constants';
import { createDataTree } from '../utils/create-data-tree';
import FetchAPI from '../utils/Fetcher';
import { GetTimeCampTasksDto, TimeCampTaskPaginator } from './dto/get-task.dto';
import { TimeCampUserPaginator } from './dto/get-user.dto';
import { ITask } from './types/task.interface';
import { ITcLocation, IUserGroup, TGroupSet } from './types/types';
import {
  IUser,
  IUserPermissions,
  IGroupPermissions,
} from './types/user.interface';

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

  async getTimeCampUsers(): Promise<TimeCampUserPaginator> {
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

  async getTimeCampUsersByIds(userIds: string[]): Promise<IUser[]> {
    const { data } = await this.timeCampAxios.default.get<IUser[]>(
      `/third_party/api/user/${userIds.join()}`,
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

  async getUserEntries(
    userId: string,
    startDate?: string,
    endDate?: string,
  ): Promise<TimeCampUserPaginator> {
    const today = new Date().toISOString().slice(0, 10);

    const params = {
      from: startDate ?? today,
      to: endDate ?? today,
      user_ids: userId,
      format: 'json',
    };
    const { data } = await this.timeCampAxios.default.get<IUser[]>(
      '/third_party/api/entries',
      {
        params,
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

  async getUsersLocations(userIds: number[]): Promise<ITcLocation[]> {
    const params = {
      user_ids: userIds
        .filter((userId, i) => userIds.indexOf(userId) == i)
        .join(','),
    };
    const { data } = await this.timeCampAxios.default.get<{
      locations: ITcLocation[];
    }>(`${LOCATION_SERVICE_URL}/gps/locations/latest/${this.token}`, {
      params,
    });

    return data.locations;
  }

  async getAllGroups(): Promise<IUserGroup[]> {
    const { data } = await this.timeCampAxios.default.get<IUserGroup[]>(
      '/third_party/api/group?format=json',
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

  async getUserGroupsWithPermissions(
    userId: string,
  ): Promise<Array<IGroupPermissions>> {
    const { data } = await this.timeCampAxios.default.get<IUserPermissions>(
      '/internal/api/people-picker?format=json',
      {
        headers: {
          Accept: 'application/json',
          'Accept-Encoding': 'gzip,deflate,compress',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.token}`,
        },
      },
    );
    return Object.values(data.groups).filter((group) => {
      return Object.values(group.users || {}).find(
        (user) =>
          user.user_id === userId &&
          user.activated === '1' &&
          user.disabledUser === false &&
          (user.role_id === '1' || user.role_id === '2'), // Role 1 -> Administrator, 2 -> supervisior
      );
    });
  }

  async getUserGroupsHierarchy(adminInGroups: string[]): Promise<TGroupSet> {
    const [users, groups] = await Promise.all([
      this.getTimeCampUsers(),
      this.getAllGroups(),
    ]);

    let groupSet = buildGroupHierarchy(groups, users.data);

    const adminInGroupsSet = adminInGroups.reduce((adminInGroups, groupId) => {
      adminInGroups[groupId] = true;
      return adminInGroups;
    }, {});

    groupSet = filterGroupsWithAccesses(groupSet, adminInGroupsSet);
    return groupSet;
  }
  async getAccessibleUserIds(adminInGroups: string[]): Promise<string[]> {
    const groupSet = await this.getUserGroupsHierarchy(adminInGroups);
    const users = Object.values(groupSet)
      .map((group) => getUsersFromGroupSets(group))
      .flat();
    return users.map((user) => user.user_id);
  }
}
