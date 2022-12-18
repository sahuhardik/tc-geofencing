import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthResponse } from './dto/create-auth.dto';
import { IUser } from 'src/users/user.interface';
import UserService from 'src/users/users.service';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async login(user: IUser): Promise<AuthResponse> {
    const payload = {
      sub: JSON.stringify(user),
      iat: Date.now(),
      type: 'ACCESS',
    };
    return {
      token: this.jwtService.sign(payload),
    };
  }

  async validateUser(token: string): Promise<any> {
    const userService = new UserService(token);

    const user = await userService.getUserSettings();
    if (user) {
      return { ...user, token };
    }
    return null;
  }
}
