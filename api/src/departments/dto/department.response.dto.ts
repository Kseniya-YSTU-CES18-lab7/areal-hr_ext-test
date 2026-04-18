import { Expose } from 'class-transformer';

export class DepartmentResponseDto {
  @Expose()
  id!: number;

  @Expose()
  name!: string;

  @Expose()
  comment!: string | null;

  @Expose()
  organizationId!: number;   // внешний ключ

  @Expose()
  parentId!: number | null;  // родительский отдел

  @Expose()
  createdAt!: Date;

  @Expose()
  updatedAt!: Date;

  // НЕ ставим @Expose() для deletedAt
}