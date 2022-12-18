import { Strategy } from 'passport-custom';
import { PassportStrategy } from '@nestjs/passport';
import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(private authService: AuthService) {
    super();
  }

  async validate(req: Request): Promise<any> {
    if (!(req.body as any).token) {
      throw new NotFoundException();
    }
    const user = await this.authService.validateUser((req.body as any).token);
    if (!user) {
      throw new UnauthorizedException('You have entered wrong api token.');
    }
    return user;
  }
}
