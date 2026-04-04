import { IsString, IsNotEmpty, MaxLength, IsUUID, IsNumber } from 'class-validator';
import { Transform } from 'class-transformer';

/**
 * DTO для создания файла
 * Связь с сотрудником: N:1 (у одного сотрудника может быть много файлов)
 */
export class CreateFileDto {
  // ID сотрудника (обязательное поле, UUID)
  @IsUUID('4', { message: 'employee_id должен быть корректным UUID' })
  @IsNotEmpty({ message: 'employee_id не может быть пустым' })
  employee_id: string;

  // Оригинальное имя файла (обязательное поле, обрезаем пробелы)
  @IsString({ message: 'Название должно быть строкой' })
  @IsNotEmpty({ message: 'Название не может быть пустым' })
  @MaxLength(255, { message: 'Название не может превышать 255 символов' })
  @Transform(({ value }) => value?.trim())
  title: string;

  // Путь к файлу на сервере (обязательное поле)
  @IsString({ message: 'Путь к файлу должен быть строкой' })
  @IsNotEmpty({ message: 'Путь к файлу не может быть пустым' })
  @MaxLength(500, { message: 'Путь не может превышать 500 символов' })
  file_path: string;

  // MIME-тип файла (обязательное поле)
  @IsString({ message: 'MIME-тип должен быть строкой' })
  @IsNotEmpty({ message: 'MIME-тип не может быть пустым' })
  @MaxLength(100, { message: 'MIME-тип не может превышать 100 символов' })
  mime_type: string;

  // Размер файла в байтах (обязательное поле)
  @IsNumber({}, { message: 'Размер должен быть числом' })
  @IsNotEmpty({ message: 'Размер не может быть пустым' })
  size_bytes: number;
}