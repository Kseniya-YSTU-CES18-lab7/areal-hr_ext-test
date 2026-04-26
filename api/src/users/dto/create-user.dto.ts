import { IsString, IsNotEmpty, IsOptional, IsEnum, MinLength, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateUserDto {
  @IsString({ message: 'Фамилия должна быть строкой' })
  @IsNotEmpty({ message: 'Фамилия не может быть пустой' })
  @MaxLength(100, { message: 'Фамилия не может превышать 100 символов' })
  @Transform(({ value }) => value?.trim())
  surname!: string;

  @IsString({ message: 'Имя должно быть строкой' })
  @IsNotEmpty({ message: 'Имя не может быть пустым' })
  @MaxLength(100, { message: 'Имя не может превышать 100 символов' })
  @Transform(({ value }) => value?.trim())
  firstName!: string;

  @IsOptional()
  @IsString({ message: 'Отчество должно быть строкой' })
  @MaxLength(100, { message: 'Отчество не может превышать 100 символов' })
  @Transform(({ value }) => value?.trim())
  patronymic?: string;

  @IsString({ message: 'Логин должен быть строкой' })
  @IsNotEmpty({ message: 'Логин не может быть пустым' })
  @MinLength(3, { message: 'Логин должен содержать минимум 3 символа' })
  @MaxLength(100, { message: 'Логин не может превышать 100 символов' })
  @Transform(({ value }) => value?.trim())
  login!: string;

  @IsString({ message: 'Пароль должен быть строкой' })
  @IsNotEmpty({ message: 'Пароль не может быть пустым' })
  @MinLength(6, { message: 'Пароль должен содержать минимум 6 символов' })
  password!: string;

  @IsOptional()
  @IsEnum(['admin', 'manager'], { message: 'Роль должна быть admin или manager' })
  role?: 'admin' | 'manager';
}