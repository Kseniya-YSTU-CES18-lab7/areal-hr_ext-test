import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class LoginUserDto {
  @IsString({ message: 'Логин должен быть строкой' })
  @IsNotEmpty({ message: 'Логин не может быть пустым' })
  login!: string;

  @IsString({ message: 'Пароль должен быть строкой' })
  @IsNotEmpty({ message: 'Пароль не может быть пустым' })
  @MinLength(6, { message: 'Пароль должен содержать минимум 6 символов' })
  password!: string;
}