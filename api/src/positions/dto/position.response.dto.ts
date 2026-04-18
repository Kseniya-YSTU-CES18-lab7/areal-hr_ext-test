import { Expose } from 'class-transformer';

export class PositionResponseDto {
  @Expose()
  id!: number;

  @Expose()
  name!: string;

  @Expose()
  createdAt!: Date;

  @Expose()
  updatedAt!: Date;

  // deletedAt не экспонируем
}