import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { RoleModule } from 'src/role/role.module';
import { User } from './entities/user.entity';
import {
  TypeOrmUserRepository,
  USER_REPOSITORY,
} from './repositories/typeorm-user.repository';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TestController } from './test.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User]), RoleModule, forwardRef(() => AuthModule)],
  controllers: [UserController, TestController],
  providers: [
    UserService,
    { provide: USER_REPOSITORY, useClass: TypeOrmUserRepository },
  ],
  exports: [UserService, USER_REPOSITORY],
})
export class UserModule {}
