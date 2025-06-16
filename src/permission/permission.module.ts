import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermissionService } from './permission.service';
import { PermissionController } from './permission.controller';
import { Permission } from './entities/permission.entity';
import { TypeOrmPermissionRepository } from './repositories/typeorm-permission.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Permission])],
  controllers: [PermissionController],
  providers: [PermissionService, TypeOrmPermissionRepository],
  exports: [PermissionService, TypeOrmPermissionRepository],
})
export class PermissionModule {}
