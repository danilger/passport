import { Permission } from 'src/permission/entities/permission.entity';
import { Role } from 'src/role/entities/role.entity';
import { User } from 'src/user/entities/user.entity';

/**
 * Aбстрактный интерфейс, который будет описывать контракт для работы с данными.
 * Это позволит унифицировать методы независимо от источника данных.
 * Здесь T — это тип сущности, с которой работает репозиторий (например, User, Product и т.д.).
 */
export interface IRepository<T> {
  findById(id: string, options?: { cache?: { id: string; milliseconds: number } }): Promise<T | null>;
  findAll(params: QueryParams): Promise<T[]>;
  create(data: Partial<T>): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T | null>;
  delete(id: string): Promise<boolean>;
  count(search?: string, filters?:Record<string,any>): Promise<number>;
}

/**
 * Интерфейс репозитория для работы с сущностью пользователя.
 * Расширяет базовый интерфейс {@link IRepository} специфичными для пользователя методами.
 */
export interface IUserRepository extends IRepository<User> {
  /**
   * Поиск пользователя по имени
   */
  findByName(name: string): Promise<User | null>;

  /**
   * Сохранение сущности пользователя
   */
  save(entity: User): Promise<User>;
}

/**
 * Интерфейс репозитория для работы с разрешениями.
 * Расширяет базовый интерфейс {@link IRepository} специфичными для разрешений методами.
 */
export interface IPermissionRepository extends IRepository<Permission> {
  /**
   * Поиск разрешения по имени
   */
  findByName(name: string): Promise<Permission | null>;

  /**
   * Поиск нескольких разрешений по их названиям
   */
  findByNames(names: string[]): Promise<Permission[] | null>;

  /**
   * Сохранение сущности разрешения
   */
  save(entity: Permission): Promise<Permission>;
}

/**
 * Интерфейс репозитория для работы с ролями.
 * Расширяет базовый интерфейс {@link IRepository} специфичными для ролей методами.
 */
export interface IRoleRepository extends IRepository<Role> {
  /**
   * Поиск ролей по имени
   */
  findByName(name: string): Promise<Role | null>;

  /**
   * Поиск нескольких ролей по их названиям
   */
  findByNames(names: string[]): Promise<Role[] | null>;

  /**
   * Сохранение сущности роли
   */
  save(entity: Role): Promise<Role>;
}

export interface QueryParams {
  skip: number;
  take: number;
  search?: string;
  filters?: Record<string, string>;
}
