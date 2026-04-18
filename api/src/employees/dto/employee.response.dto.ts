import { Expose } from 'class-transformer';

export class EmployeeResponseDto {
  @Expose()
  id!: string;

  @Expose()
  surname!: string;

  @Expose()
  firstName!: string;

  @Expose()
  patronymic!: string | null;

  @Expose()
  birthDate!: Date | null;

  @Expose()
  createdAt!: Date;

  @Expose()
  updatedAt!: Date;

  // НЕ экспонируем deletedAt
}