import { Injectable, ForbiddenException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { User } from '../users/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUserById(userId: string, pass: string): Promise<any> {
    const user = await this.usersService.getById(userId);
    if (user && user.comparePassword(pass)) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async validateUserByEmail(email: string, pass: string): Promise<any> {
    const user = await this.usersService.getByEmail(email);

    if (!user) return null;

    const confirmed = await user.comparePassword(pass);

    if (!confirmed) return null;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = user;
    return result;
  }

  async createToken(user: User) {
    if (!user.email) {
      throw new ForbiddenException(
        'User is only registered by phone and not by email',
      );
    }
    const payload = { email: user.email, sub: user.id };
    return {
      // eslint-disable-next-line @typescript-eslint/camelcase
      access_token: this.jwtService.sign(payload),
    };
  }
}
