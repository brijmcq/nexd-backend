import {Logger, Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';

import {User} from './user.entity';
import {UsersService} from './user.service';
import {UserController} from './user.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  exports: [UsersService],
  controllers: [UserController],
  providers: [UsersService],
})
export class UserModule {
}
