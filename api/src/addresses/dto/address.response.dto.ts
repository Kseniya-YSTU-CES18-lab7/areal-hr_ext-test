import { Expose } from 'class-transformer';

export class AddressResponseDto {
  @Expose()
  id!: number;

  @Expose()
  employeeId!: string;

  @Expose()
  region!: string | null;

  @Expose()
  locality!: string | null;

  @Expose()
  street!: string | null;

  @Expose()
  house!: string | null;

  @Expose()
  building!: string | null;

  @Expose()
  apartment!: string | null;

  @Expose()
  createdAt!: Date;

  @Expose()
  updatedAt!: Date;

  // deletedAt не экспонируем
}