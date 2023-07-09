import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthResponse } from './dto/create-auth.dto';
import { IUser } from '../timecamp/types/user.interface';
import { TimeCampService } from '../timecamp/timecamp.service';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async login(user: IUser, token: string): Promise<AuthResponse> {
    const timeCampService = new TimeCampService(token);

    const groups = await timeCampService.getUserGroupsWithPermissions(
      user.user_id,
    );

    const usersGroupAsAdmin = Object.values(groups);

    if (Object.keys(groups).length === 0) {
      throw new HttpException(
        'Not having access to login',
        HttpStatus.FORBIDDEN,
      );
    }
    const payload = {
      sub: JSON.stringify({
        ...user,
        adminInGroups: usersGroupAsAdmin.map((group) => group.group_id),
      }),
      iat: Date.now(),
      type: 'ACCESS',
    };
    return {
      token: this.jwtService.sign(payload),
    };
  }

  async validateUser(token: string): Promise<any> {
    const timeCampService = new TimeCampService(token);

    const user = await timeCampService.getUserSettings();
    if (user) {
      return { ...user, token };
    }
    return null;
  }
}
