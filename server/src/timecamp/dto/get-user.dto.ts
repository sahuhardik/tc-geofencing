import { IUser } from '../types/user.interface';

export class TimeCampUserPaginator {
  data: IUser[];
}

export class GetTimeCampUsersDto {
  search?: string;
}
