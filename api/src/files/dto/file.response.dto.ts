import { Expose } from 'class-transformer';

export class FileResponseDto {
  @Expose()
  id!: number;

  @Expose()
  employeeId!: string;

  @Expose()
  title!: string;

  @Expose()
  filePath!: string;

  @Expose()
  mimeType!: string | null;

  @Expose()
  sizeBytes!: number | null;

  @Expose()
  createdAt!: Date;

  // deletedAt не экспонируем
}