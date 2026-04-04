import { IsString, IsNotEmpty, IsOptional, IsDate, MaxLength, IsUUID } from 'class-validator';
import { Transform } from 'class-transformer';

/**
 * DTO для создания паспортных данных
 * Связь с сотрудником: 1:1
 * Российские и иностранные паспорта
 */
export class CreatePassportDto {
  // ID сотрудника (обязательное поле, UUID)
  @IsUUID('4', { message: 'employee_id должен быть корректным UUID' })
  @IsNotEmpty({ message: 'employee_id не может быть пустым' })
  employeeId: string;

  // Серия паспорта (необязательное поле — у некоторых документов нет серии)
  @IsOptional()
  @IsString({ message: 'Серия должна быть строкой' })
  @MaxLength(20, { message: 'Серия не может превышать 20 символов' })
  @Transform(({ value }) => value?.trim())
  series?: string;

  // Номер паспорта (обязательное поле, есть у любого документа)
  @IsString({ message: 'Номер должен быть строкой' })
  @IsNotEmpty({ message: 'Номер не может быть пустым' })
  @MaxLength(20, { message: 'Номер не может превышать 20 символов' })
  @Transform(({ value }) => value?.trim())
  number: string;

  // Дата выдачи (обязательное поле, есть у любого документа)
  @IsDate({ message: 'Дата выдачи должна быть корректной датой' })
  @IsNotEmpty({ message: 'Дата выдачи не может быть пустой' })
  @Transform(({ value }) => value ? new Date(value) : undefined)
  issueDate: Date;

  // Код подразделения (необязательное поле — только для российских паспортов)
  @IsOptional()
  @IsString({ message: 'Код подразделения должен быть строкой' })
  @MaxLength(10, { message: 'Код подразделения не может превышать 10 символов' })
  @Transform(({ value }) => value?.trim())
  departmentCode?: string;

  // Кем выдан (обязательное поле, есть у любого документа)
  @IsString({ message: 'Кем выдан должен быть строкой' })
  @IsNotEmpty({ message: 'Кем выдан не может быть пустым' })
  @MaxLength(255, { message: 'Кем выдан не может превышать 255 символов' })
  @Transform(({ value }) => value?.trim())
  issuedBy: string;
}