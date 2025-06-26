import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PermissionModule } from './permission/permission.module';
import { RoleModule } from './role/role.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: process.env.NODE_ENV === 'test' ? '.env.test' : '.env',
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USER'),
        password: configService.get('DB_PASSWORD'),
        database: 'postgres',
        autoLoadEntities: process.env.NODE_ENV === 'test', // автоматически загружает сущности только в тестовом окружении
        synchronize: process.env.NODE_ENV === 'test', // синхронизация схемы только в тестовом окружении
        entities: [join(__dirname, '**', '*.entity.{ts,js}')],
        migrations: [join(__dirname, 'migrations', '**', '*.{ts,js}')],
        seeds: [join(__dirname, 'seeds', '**', '*.{ts,js}')],
        factories: [join(__dirname, 'factories', '**', '*.{ts,js}')],
        cli: {
          migrationsDir: join(__dirname, 'migrations'),
        },
      }),
      inject: [ConfigService],
    }),
    UserModule,
    RoleModule,
    PermissionModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
