import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthResponse } from './dto/create-auth.dto';
import { IUser } from 'src/timecamp/types/user.interface';
import { TimeCampService } from 'src/timecamp/timecamp.service';

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
    const timeCampService = new TimeCampService(token);

    const user = await timeCampService.getUserSettings();
    if (user) {
      return { ...user, token };
    }
    return null;
  }
}
