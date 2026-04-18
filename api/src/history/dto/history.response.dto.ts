import { Expose } from 'class-transformer';

export class HistoryResponseDto {
  @Expose()
  id!: number;

  @Expose()
  userId!: string;

  @Expose()
  entityType!: string;

  @Expose()
  entityId!: string;

  @Expose()
  fieldName!: string;

  @Expose()
  oldValue!: string | null;

  @Expose()
  newValue!: string | null;

  @Expose()
  operationType!: string;

  @Expose()
  createdAt!: Date;

  @Expose()
  updatedAt!: Date;
}