export interface IUser {
  user_id: string;
  email: string;
  display_name: string;
  time_zone?: string;
  token?: string;
  group_id: string;
}
