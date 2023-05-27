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
