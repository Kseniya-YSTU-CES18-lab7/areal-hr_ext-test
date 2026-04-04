import { IsString, IsNotEmpty, IsOptional, IsIn, MaxLength, IsUUID } from 'class-validator';
import { Transform } from 'class-transformer';

/**
 * DTO для создания записи в истории изменений
 */
export class CreateHistoryDto {
  // ID пользователя, который сделал изменение (обязательное поле, UUID)
  @IsUUID('4', { message: 'user_id должен быть корректным UUID' })
  @IsNotEmpty({ message: 'user_id не может быть пустым' })
  user_id: string;

  // Тип изменённой сущности (только из списка)
  @IsString({ message: 'Тип сущности должен быть строкой' })
  @IsNotEmpty({ message: 'Тип сущности не может быть пустым' })
  @IsIn(['Organization', 'Department', 'Position', 'Employee', 'HROperation'], {
    message: 'Тип сущности должен быть: Organization, Department, Position, Employee или HROperation'
  })
  entity_type: string;

  // ID изменённой записи (TEXT для поддержки UUID и SERIAL)
  @IsString({ message: 'ID сущности должен быть строкой' })
  @IsNotEmpty({ message: 'ID сущности не может быть пустым' })
  entity_id: string;

  // Название изменённого поля
  @IsString({ message: 'Имя поля должно быть строкой' })
  @IsNotEmpty({ message: 'Имя поля не может быть пустым' })
  @MaxLength(100, { message: 'Имя поля не может превышать 100 символов' })
  field_name: string;

  // Старое значение (NULL при создании записи)
  @IsOptional()
  @IsString({ message: 'Старое значение должно быть строкой' })
  old_value?: string;

  // Новое значение (NULL при удалении записи)
  @IsOptional()
  @IsString({ message: 'Новое значение должно быть строкой' })
  new_value?: string;

  // Тип операции (только из списка)
  @IsString({ message: 'Тип операции должен быть строкой' })
  @IsNotEmpty({ message: 'Тип операции не может быть пустым' })
  @IsIn(['create', 'update', 'delete'], {
    message: 'Тип операции должен быть: create, update или delete'
  })
  operation_type: string;
}