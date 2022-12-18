import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { LocalStrategy } from './passport-strategy/local.strategy';
import { JwtStrategy } from './passport-strategy/jwt.strategy';
import { jwtConstants } from 'src/common/constants';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: jwtConstants.expires },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy],
})
export class AuthModule {}
