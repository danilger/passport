import { queryDto } from '../dto/query.dto';
import { QueryParams } from '../interfaces/repository.interface';

/**
 * Адаптер преобразует queryDto в параметры пагинации для репозитория
 * @param query - параметры запроса
 * @returns объект с skip, take и search
 */
export const makeParams = (query: queryDto): QueryParams => {
  const { page, perPage, search } = cleanQuery(query);
  const skip = (page - 1) * perPage;
  const take = perPage;
  return { skip, take, search };
};

//HELPER
const cleanQuery = (query: queryDto): IcleanQuery => {
  return {
    page: Number(query.page) || 1,
    perPage: Number(query.perPage) || 10,
    search: query.q ? query.q.trim() : undefined,
  };
};

//INERFACES
interface IcleanQuery {
  page: number;
  perPage: number;
  search?: string;
}
