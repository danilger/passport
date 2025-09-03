import { ApiProperty } from '@nestjs/swagger';
import * as bcrypt from 'bcrypt';
import { Exclude } from 'class-transformer';
import {
  BeforeInsert,
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Role } from '../../role/entities/role.entity'; // путь должен быть относительным иначе возникает ошибка при создании миграции

@Entity('user')
export class User {
  @ApiProperty({ description: 'Уникальный идентификатор пользователя' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Имя пользователя (уникальное)' })
  @Column({ unique: true })
  username: string;

  @ApiProperty({ description: 'Email пользователя (уникальный)' })
  @Column({ unique: true })
  email: string;

  @ApiProperty({ description: 'Полное имя пользователя', required: false })
  @Column({ nullable: true })
  fullName: string;

  @ApiProperty({ description: 'Пароль пользователя', writeOnly: true })
  @Column()
  @Exclude()
  password: string;

  @ApiProperty({ description: 'Статус активности пользователя', default: true })
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty({
    description: 'Статус верификации пользователя',
    default: false,
  })
  @Column({ default: false })
  isVerified: boolean;

  @ApiProperty({ description: 'URL аватара пользователя', required: false })
  @Column({ nullable: true })
  avatarUrl: string;

  @ApiProperty({ description: 'Номер телефона пользователя', required: false })
  @Column({ nullable: true })
  phoneNumber: string;

  @ApiProperty({
    description: 'Провайдер аутентификации (например, local, google, github)',
    required: false,
  })
  @Column({ nullable: true })
  authProvider: string; // eg. 'local', 'google', 'github'

  @ApiProperty({
    description: 'Локаль пользователя (например, en, ru)',
    required: false,
  })
  @Column({ nullable: true })
  locale: string; // eg. 'en', 'ru'

  @ApiProperty({ description: 'Часовой пояс пользователя', required: false })
  @Column({ nullable: true })
  timezone: string;

  @ApiProperty({
    description: 'Роли пользователя',
    type: () => Role,
    isArray: true,
  })
  @ManyToMany(() => Role, (role) => role.users)
  @JoinTable()
  roles: Role[];

  @BeforeInsert() // Хешируем пароль перед вставкой
  async hashPassword() {
    if (this.password) {
      this.password = await bcrypt.hash(this.password, 10);
    }
  }

  // Метод проверки пароля
  async comparePassword(plain: string): Promise<boolean> {
    return bcrypt.compare(plain, this.password);
  }
}
