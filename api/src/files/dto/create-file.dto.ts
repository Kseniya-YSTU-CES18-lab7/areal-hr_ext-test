import { IsString, IsNotEmpty, MaxLength, IsUUID, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

/**
 * DTO для создания файла
 * Связь с сотрудником: N:1 (у одного сотрудника может быть много файлов)
 * filePath, mimeType и sizeBytes заполняются автоматически сервисом
 */
export class CreateFileDto {
  // ID сотрудника (обязательное поле, UUID)
  @IsUUID('4', { message: 'employeeId должен быть корректным UUID' })
  @IsNotEmpty({ message: 'employeeId не может быть пустым' })
  employeeId!: string;

  // Оригинальное имя файла (обязательное поле, обрезаем пробелы)
  @IsString({ message: 'Название должно быть строкой' })
  @IsNotEmpty({ message: 'Название не может быть пустым' })
  @MaxLength(255, { message: 'Название не может превышать 255 символов' })
  @Transform(({ value }) => value?.trim())
  title!: string;

  // MIME-тип файла (опциональное поле, заполняется автоматически)
  @IsOptional()
  @IsString({ message: 'MIME-тип должен быть строкой' })
  @MaxLength(100, { message: 'MIME-тип не может превышать 100 символов' })
  mimeType?: string;
}