import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from 'src/auth/auth.service';
import {
  IRoleRepository,
  IUserRepository,
  QueryParams,
} from 'src/common/interfaces/repository.interface';
import { ROLE_REPOSITORY } from 'src/role/repositories/typeorm-role.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { USER_REPOSITORY } from './repositories/typeorm-user.repository';

@Injectable()
export class UserService {
  constructor(
    @Inject(USER_REPOSITORY)
    private repository: IUserRepository,
    @Inject(ROLE_REPOSITORY)
    private readonly roleRepository: IRoleRepository,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const existingUser = await this.findByUsername(createUserDto.username);
    if (existingUser) {
      throw new BadRequestException(
        'Пользователь с таким именем уже существует',
      );
    }
    try {
      return this.repository.create(createUserDto);
    } catch (error) {
      throw new BadRequestException('Ошибка при создании пользователя');
    }
  }

  async findAll(params: QueryParams) {
    try {
      const data = await this.repository.findAll(params);
      const total = await this.repository.count(params.search);
      return { data, total };
    } catch (error) {
      throw new BadRequestException(
        'Ошибка при получении списка пользователей',
      );
    }
  }

  async findOne(id: string) {
    try {
      const user = await this.repository.findById(id);
      if (!user) {
        throw new NotFoundException(`Пользователь с ID "${id}" не найден`);
      }
      return user;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Ошибка при поиске пользователя');
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    try {
      return this.repository.update(id, updateUserDto);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Ошибка при обновлении пользователя');
    }
  }

  async remove(id: string) {
    try {
      const user = await this.findOne(id);
      const hasUserRole =
        user.roles.find((role) => role.name == 'admin') || null;

      if (hasUserRole) {
        throw new BadRequestException(
          'Нельзя удалить пользователя с ролью администратора',
        );
      }
      return this.repository.delete(id);
    } catch (error) {
      // так иначе будте возвращать ошибку BadRequestException
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Ошибка при удалении пользователя');
    }
  }

  async findByUsername(username: string): Promise<User | null> {
    try {
      return this.repository.findByName(username);
    } catch (error) {
      throw new BadRequestException('Ошибка при поиске пользователя по имени');
    }
  }

  async setRoleToUser(id: string, roles: string[]) {
    try {
      const user = await this.repository.findById(id);
      if (!user) {
        throw new NotFoundException(`Пользователь с ID "${id}" не найден`);
      }

      const rolesArray = await this.roleRepository.findByNames(roles);
      if (!rolesArray) {
        throw new NotFoundException(`Роли с именами "${roles}" не найдены`);
      }

      // Инициализируем массив ролей, если он не существует
      if (!user.roles) {
        user.roles = [];
      }

      // Обновляем список ролей
      user.roles = [...user.roles, ...rolesArray];

      // Убираем дубликаты по id
      user.roles = user.roles.filter(
        (role, index, self) =>
          index === self.findIndex((r) => r.id === role.id),
      );
      
      //Сохраняем пользователя с обновленными ролями
      await this.repository.save(user);
      
      return this.repository.findById(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Ошибка при назначении ролей пользователю');
    }
  }

  async changePassword(
    { newPassword, previousPassword }: UpdatePasswordDto,
    req: Request & { user: { userId: string; username: string } },
  ) {
    if (!req?.user) {
      throw new UnauthorizedException('Пользователь не авторизован');
    }

    const validUser = await this.authService.validateUser(
      req.user.username,
      previousPassword,
    );

    if (!validUser) {
      throw new UnauthorizedException('Неверный старый пароль');
    }

    try {
      await this.repository.update(req.user.userId, {
        password: await bcrypt.hash(newPassword, 10),
      });
      return { message: 'Пароль успешно изменен' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Ошибка при смене пароля');
    }
  }

  async getMe(
    req: Request & { user: { userId: string; username: string } },
  ): Promise<{
    id: string;
    username: string;
    roles: string[];
  }> {
    try {
      const user = await this.findOne(req.user.userId);
      if (!user) {
        throw new NotFoundException('Пользователь не найден');
      }
      return {
        id: user.id,
        username: user.username,
        roles: user.roles.map((role) => role.name),
      };
    } catch (error) {
      throw new BadRequestException('Ошибка при получении данных пользователя');
    }
  }
}
