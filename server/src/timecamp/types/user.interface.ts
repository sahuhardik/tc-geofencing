export interface IUser {
  user_id: string;
  email: string;
  display_name: string;
  time_zone?: string;
  token?: string;
  group_id: string;
  root_group_id: string;
  adminInGroups: string[];
}

export interface IGroupPermissions {
  group_id: string;
  users: Record<
    string,
    {
      user_id: string;
      activated: string;
      disabledUser: boolean;
      role_id: string;
    }
  >;
}
export interface IUserPermissions {
  groups: Record<string, IGroupPermissions>;
}
