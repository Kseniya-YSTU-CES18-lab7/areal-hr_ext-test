import { Expose } from 'class-transformer';

export class PassportResponseDto {
  @Expose()
  id!: number;

  @Expose()
  employeeId!: string;

  @Expose()
  series!: string;

  @Expose()
  number!: string;

  @Expose()
  issueDate!: Date | null;

  @Expose()
  departmentCode!: string | null;

  @Expose()
  issuedBy!: string | null;

  @Expose()
  createdAt!: Date;

  @Expose()
  updatedAt!: Date;

  // deletedAt не экспонируем
}