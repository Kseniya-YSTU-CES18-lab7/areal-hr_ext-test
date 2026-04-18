import { Expose } from 'class-transformer';

export class HrOperationResponseDto {
  @Expose()
  id!: number;

  @Expose()
  employeeId!: string;

  @Expose()
  departmentId!: number | null;

  @Expose()
  positionId!: number | null;

  @Expose()
  salary!: number | null;

  @Expose()
  operationDate!: Date;

  @Expose()
  operationType!: string;

  @Expose()
  createdAt!: Date;

  @Expose()
  updatedAt!: Date;

  // deletedAt не экспонируем
}