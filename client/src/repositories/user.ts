import { LoginInput } from '@ts-types/generated';
import http from '@utils/api/http';
import Base from './base';

class User extends Base<{}, {}> {
  me = async (url: string) => {
    return this.http(url, 'get');
  };

  login = async (url: string, variables: LoginInput) => {
    return this.http<LoginInput>(url, 'post', variables);
  };

  logout = async (url: string) => {
    return http.post(url);
  };
}

export default new User();
