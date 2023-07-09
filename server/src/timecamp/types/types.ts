import { IUser } from './user.interface';

export interface IUserGroup {
  group_id: string;
  name: string;
  parent_id: string;
}

export interface IUserGroupNode {
  group_id: string;
  name: string;
  parent_id: string;
  childrens: IUserGroupNode[];
  users: IUser[];
}

export interface ITcLocation {
  user_id: string | number;
  datetime_utc: string;
  longitude: string;
  latitude: string;
}

export type TGroupSet = Record<string, IUserGroupNode>;
