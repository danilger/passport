import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermissionService } from './permission.service';
import { PermissionController } from './permission.controller';
import { Permission } from './entities/permission.entity';
import {
  PERMISSION_REPOSITORY,
  TypeOrmPermissionRepository,
} from './repositories/typeorm-permission.repository';
import { RoleModule } from 'src/role/role.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Permission]),
    forwardRef(() => RoleModule),
  ],
  controllers: [PermissionController],
  providers: [
    PermissionService,
    {
      provide: PERMISSION_REPOSITORY,
      useClass: TypeOrmPermissionRepository,
    },
  ],
  exports: [PermissionService, PERMISSION_REPOSITORY],
})
export class PermissionModule {}
