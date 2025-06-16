import * as bcrypt from 'bcrypt';
import { IsEmail } from 'class-validator';
import { Role } from '../../role/entities/role.entity'; // путь должен быть относительным иначе возникает ошибка при создании миграции
import { BeforeInsert, Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity('user')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  @IsEmail()
  email: string;

  @Column({ nullable: true })
  fullName: string;

  @Column()
  password: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ nullable: true })
  avatarUrl: string;

  @Column({ nullable: true })
  phoneNumber: string;

  @Column({ nullable: true })
  authProvider: string; // eg. 'local', 'google', 'github'

  @Column({ nullable: true })
  locale: string; // eg. 'en', 'ru'

  @Column({ nullable: true })
  timezone: string;

  // Хешируем пароль перед вставкой
  @BeforeInsert()
  async hashPassword() {
    if (this.password) {
      this.password = await bcrypt.hash(this.password, 10);
    }
  }

  // Метод проверки пароля
  async comparePassword(plain: string): Promise<boolean> {
    return bcrypt.compare(plain, this.password);
  }

  @ManyToMany(() => Role, (role) => role.users)
  @JoinTable()
  roles: Role[];
}
