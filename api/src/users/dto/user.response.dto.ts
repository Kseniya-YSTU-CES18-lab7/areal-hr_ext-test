import { Expose } from 'class-transformer';

export class UserResponseDto {
  @Expose()
  id!: string;

  @Expose()
  surname!: string;

  @Expose()
  firstName!: string;

  @Expose()
  patronymic!: string | null;

  @Expose()
  login!: string;

  @Expose()
  role!: 'admin' | 'manager';

  @Expose()
  createdAt!: Date;

  @Expose()
  updatedAt!: Date;

  // deletedAt и password НЕ экспонируем
}