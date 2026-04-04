import { IsString, IsNotEmpty, IsOptional, MaxLength, IsUUID } from 'class-validator';
import { Transform } from 'class-transformer';

/**
 * DTO для создания адреса регистрации
 * Связь с сотрудником: 1:1
 */
export class CreateAddressDto {
  @IsUUID('4', { message: 'employee_id должен быть корректным UUID' })
  @IsNotEmpty({ message: 'employee_id не может быть пустым' })
  employee_id: string;

  // Область/край (обязательное поле)
  @IsString({ message: 'Область должна быть строкой' })
  @IsNotEmpty({ message: 'Область не может быть пустой' })
  @MaxLength(100, { message: 'Область не может превышать 100 символов' })
  @Transform(({ value }) => value?.trim())
  region: string;

  // Населенный пункт (обязательное поле)
  @IsString({ message: 'Населённый пункт должен быть строкой' })
  @IsNotEmpty({ message: 'Населённый пункт не может быть пустым' })
  @MaxLength(100, { message: 'Населённый пункт не может превышать 100 символов' })
  @Transform(({ value }) => value?.trim())
  locality: string;

  // Улица (обязательное поле)
  @IsString({ message: 'Улица должна быть строкой' })
  @IsNotEmpty({ message: 'Улица не может быть пустой' })
  @MaxLength(100, { message: 'Улица не может превышать 100 символов' })
  @Transform(({ value }) => value?.trim())
  street: string;

  // Дом (обязательное поле)
  @IsString({ message: 'Дом должен быть строкой' })
  @IsNotEmpty({ message: 'Дом не может быть пустым' })
  @MaxLength(20, { message: 'Дом не может превышать 20 символов' })
  @Transform(({ value }) => value?.trim())
  house: string;

  // Корпус (необязательное поле)
  @IsOptional()
  @IsString({ message: 'Корпус должен быть строкой' })
  @MaxLength(20, { message: 'Корпус не может превышать 20 символов' })
  @Transform(({ value }) => value?.trim())
  building?: string;

  // Квартира (необязательное поле)
  @IsOptional()
  @IsString({ message: 'Квартира должна быть строкой' })
  @MaxLength(20, { message: 'Квартира не может превышать 20 символов' })
  @Transform(({ value }) => value?.trim())
  apartment?: string;
}