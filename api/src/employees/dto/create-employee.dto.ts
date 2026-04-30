import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';
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
  surname!: string;

  // Имя (обязательное поле, обрезаем пробелы)
  @IsString({ message: 'Имя должно быть строкой' })
  @IsNotEmpty({ message: 'Имя не может быть пустым' })
  @MaxLength(100, { message: 'Имя не может превышать 100 символов' })
  @Transform(({ value }) => value?.trim())
  firstName!: string;

  // Отчество (необязательное поле)
  @IsOptional()
  @IsString({ message: 'Отчество должно быть строкой' })
  @MaxLength(100, { message: 'Отчество не может превышать 100 символов' })
  @Transform(({ value }) => value?.trim())
  patronymic?: string;

  // Дата рождения (необязательное поле, ожидаем строку в формате YYYY-MM-DD)
  @IsOptional()
  @IsString({ message: 'Дата рождения должна быть строкой' })
  @Transform(({ value }) => value ? value.trim() : undefined)
  birthDate?: string;

  // Отдел (необязательное поле)
  @IsOptional()
  @Transform(({ value }) => {
    // Если пусто — возвращаем undefined (поле не будет отправлено)
    if (value === null || value === undefined || value === '' || value === 'null') {
      return undefined;
    }
    // Преобразуем в число
    const num = Number(value);
    return isNaN(num) ? undefined : num;
  })
  departmentId?: number;
}