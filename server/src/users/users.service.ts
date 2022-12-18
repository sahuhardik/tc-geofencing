import { TIMECAMP_HOST_URL } from 'src/common/constants';
import FetchAPI from '../utils/Fetcher';
import { IUser } from './user.interface';

export default class UserService {
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
}
