import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { TypeOrmUserRepository } from './repositories/typeorm-user.repository';
import { RoleModule } from 'src/role/role.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    RoleModule,
  ],
  controllers: [UserController],
  providers: [UserService, TypeOrmUserRepository],
  exports: [UserService, TypeOrmUserRepository],
})
export class UserModule {}
