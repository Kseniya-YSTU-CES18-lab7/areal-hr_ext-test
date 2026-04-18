import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDate,
  MaxLength,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

/**
 * DTO для создания паспорта сотрудника (вложенное в создание сотрудника)
 */
class CreatePassportInlineDto {
  @IsString({ message: 'Серия должна быть строкой' })
  @MaxLength(10, { message: 'Серия не может превышать 10 символов' })
  @Transform(({ value }) => value?.trim())
  series?: string;

  @IsString({ message: 'Номер должен быть строкой' })
  @IsNotEmpty({ message: 'Номер не может быть пустым' })
  @MaxLength(20, { message: 'Номер не может превышать 20 символов' })
  @Transform(({ value }) => value?.trim())
  number!: string;

  @IsDate({ message: 'Дата выдачи должна быть корректной датой' })
  @IsNotEmpty({ message: 'Дата выдачи не может быть пустой' })
  @Transform(({ value }) => value ? new Date(value) : undefined)
  issueDate!: Date;

  @IsString({ message: 'Код подразделения должен быть строкой' })
  @MaxLength(10, { message: 'Код подразделения не может превышать 10 символов' })
  @Transform(({ value }) => value?.trim())
  departmentCode?: string;

  @IsString({ message: 'Кем выдан должен быть строкой' })
  @IsNotEmpty({ message: 'Кем выдан не может быть пустым' })
  @MaxLength(255, { message: 'Кем выдан не может превышать 255 символов' })
  @Transform(({ value }) => value?.trim())
  issuedBy!: string;
}

/**
 * DTO для создания адреса сотрудника (вложенное в создание сотрудника)
 */
class CreateAddressInlineDto {
  @IsString({ message: 'Область должна быть строкой' })
  @IsNotEmpty({ message: 'Область не может быть пустой' })
  @MaxLength(100, { message: 'Область не может превышать 100 символов' })
  @Transform(({ value }) => value?.trim())
  region!: string;

  @IsString({ message: 'Населённый пункт должен быть строкой' })
  @IsNotEmpty({ message: 'Населённый пункт не может быть пустым' })
  @MaxLength(100, { message: 'Населённый пункт не может превышать 100 символов' })
  @Transform(({ value }) => value?.trim())
  locality!: string;

  @IsString({ message: 'Улица должна быть строкой' })
  @IsNotEmpty({ message: 'Улица не может быть пустой' })
  @MaxLength(100, { message: 'Улица не может превышать 100 символов' })
  @Transform(({ value }) => value?.trim())
  street!: string;

  @IsString({ message: 'Дом должен быть строкой' })
  @IsNotEmpty({ message: 'Дом не может быть пустым' })
  @MaxLength(20, { message: 'Дом не может превышать 20 символов' })
  @Transform(({ value }) => value?.trim())
  house!: string;

  @IsOptional()
  @IsString({ message: 'Корпус должен быть строкой' })
  @MaxLength(20, { message: 'Корпус не может превышать 20 символов' })
  @Transform(({ value }) => value?.trim())
  building?: string;

  @IsOptional()
  @IsString({ message: 'Квартира должна быть строкой' })
  @MaxLength(20, { message: 'Квартира не может превышать 20 символов' })
  @Transform(({ value }) => value?.trim())
  apartment?: string;
}

/**
 * DTO для создания сотрудника с паспортными данными и адресом в одном запросе
 * Все данные сохраняются в одной транзакции
 */
export class CreateEmployeeFullDto {
  // === Данные сотрудника ===
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

  @IsOptional()
  @IsDate({ message: 'Дата рождения должна быть корректной датой' })
  @Transform(({ value }) => value ? new Date(value) : undefined)
  birthDate?: Date;

  // === Паспортные данные (опционально, но если есть — сохраняем в той же транзакции) ===
  @IsOptional()
  @ValidateNested()
  @Type(() => CreatePassportInlineDto)
  passport?: CreatePassportInlineDto;

  // === Адрес регистрации (опционально, но если есть — сохраняем в той же транзакции) ===
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateAddressInlineDto)
  address?: CreateAddressInlineDto;
}