import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleService } from './role.service';
import { RoleController } from './role.controller';
import { Role } from './entities/role.entity';
import {
  ROLE_REPOSITORY,
  TypeOrmRoleRepository,
} from './repositories/typeorm-role.repository';
import { PermissionModule } from 'src/permission/permission.module';

@Module({
  imports: [TypeOrmModule.forFeature([Role]), forwardRef(() => PermissionModule)],
  controllers: [RoleController],
  providers: [
    RoleService,
    {
      provide: ROLE_REPOSITORY,
      useClass: TypeOrmRoleRepository,
    },
  ],
  exports: [RoleService, ROLE_REPOSITORY],
})
export class RoleModule {}
