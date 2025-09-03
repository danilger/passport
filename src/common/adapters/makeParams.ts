import { queryDto } from '../dto/query.dto';
import { QueryParams } from '../interfaces/repository.interface';

/**
 * Адаптер преобразует queryDto в параметры для сервиса,
 * отделяет слой логики.
 * @param query - параметры запроса
 * @returns объект с skip, take и search
 */
export const makeParams = (query: queryDto): QueryParams => {
  const { page, perPage, search, filters } = cleanQuery(query);
  const skip = (page - 1) * perPage;
  const take = perPage;
  return { skip, take, search, filters };
};

//HELPER
const cleanQuery = (query: queryDto): IcleanQuery => {
  return {
    page: Number(query.page) || 1,
    perPage: Number(query.perPage) || 10,
    search: query?.q ? query.q.trim() : undefined,
    filters: query?.filters ? query.filters : undefined,
  };
};

//INERFACES
interface IcleanQuery {
  page: number;
  perPage: number;
  search?: string;
  filters?: Record<string, string>;
}
