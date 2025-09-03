import { Permission } from 'src/permission/entities/permission.entity';
import { FindOptionsWhere, ILike } from 'typeorm';

export const makeWhere = (
  search: string,
  filters: Record<string, string | number | undefined>,
  searchFieldNames: string[],
) => {
  let where: FindOptionsWhere<Permission>[] = [];
if(searchFieldNames) {  //Убираме и списка для поиска параметров которые заданы в фильтрах
  const clearSearchFieldNames = [...searchFieldNames];
  if (filters)
    Object.keys(filters).forEach((k: string) => {
      delete searchFieldNames[k];
    });

  where = [
    ...clearSearchFieldNames.map((fieldName) => {
      return { [fieldName]: ILike(`%${search}%`) };
    }),

    ...Object.entries(filters).map(([key, value]: any[]) => ({ [key]: value })),
  ];}


  return where;
};

// const where = search
//   ? [
//       { username: ILike(`%${search}%`) },
//       { email: ILike(`%${search}%`) },
//       { fullName: ILike(`%${search}%`) },
//       { phoneNumber: ILike(`%${search}%`) },
//       { authProvider: ILike(`%${search}%`) },
//       { locale: ILike(`%${search}%`) },
//       { timezone: ILike(`%${search}%`) },
//       { avatarUrl: ILike(`%${search}%`) },
//     ]
//   : {};
