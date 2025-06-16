/**
 * Aбстрактный интерфейс, который будет описывать контракт для работы с данными.
 * Это позволит унифицировать методы независимо от источника данных.
 * Здесь T — это тип сущности, с которой работает репозиторий (например, User, Product и т.д.).
 */
export interface IRepository<T> {
  findById(id: string): Promise<T | null>;
  findAll(): Promise<T[]>;
  create(data: Partial<T>): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T | null>;
  delete(id: string): Promise<boolean>;
}

export interface IFindByName<T> {
  findByName(name: string): Promise<T | null>;
}

export interface IFindByNames<T> {
  findByNames(names: string[]): Promise<T[] | null>;
}

export interface ISave<T> {
  save(entity: T): Promise<T>;
} 
