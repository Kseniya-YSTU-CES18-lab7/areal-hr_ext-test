import { IsString, IsNotEmpty, IsOptional, IsDate, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

/**
 * DTO для создания сотрудника
 * Валидация входящих данных при создании нового сотрудника
 */
export class CreateEmployeeDto {
  // Фамилия (обязательное поле, обрезаем пробелы)
  @IsString({ message: 'Фамилия должна быть строкой' })
  @IsNotEmpty({ message: 'Фамилия не может быть пустой' })
  @MaxLength(100, { message: 'Фамилия не может превышать 100 символов' })
  @Transform(({ value }) => value?.trim())
  surname: string;

  // Имя (обязательное поле, обрезаем пробелы)
  @IsString({ message: 'Имя должно быть строкой' })
  @IsNotEmpty({ message: 'Имя не может быть пустым' })
  @MaxLength(100, { message: 'Имя не может превышать 100 символов' })
  @Transform(({ value }) => value?.trim())
  first_name: string;

  // Отчество (необязательное поле)
  @IsOptional()
  @IsString({ message: 'Отчество должно быть строкой' })
  @MaxLength(100, { message: 'Отчество не может превышать 100 символов' })
  @Transform(({ value }) => value?.trim())
  patronymic?: string;

  // Дата рождения (необязательное поле, преобразуем в объект Date)
  @IsOptional()
  @IsDate({ message: 'Дата рождения должна быть корректной датой' })
  @IsNotEmpty({ message: 'Дата рождения не может быть пустой' })
  @Transform(({ value }) => value ? new Date(value) : undefined)
  birth_date: Date;
}