import { IsString, IsNotEmpty, IsOptional, IsDate, IsUUID, IsInt, IsNumber, IsIn, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

/**
 * DTO для создания кадровой операции
 * Типы операций: hire (приём), change_salary (изменение зарплаты),
 * change_department (перевод), dismissal (увольнение)
 */
export class CreateHrOperationDto {
  // ID сотрудника (обязательное поле, UUID)
  @IsUUID('4', { message: 'employee_id должен быть корректным UUID' })
  @IsNotEmpty({ message: 'employee_id не может быть пустым' })
  employee_id: string;

  // Тип операции (обязательное поле, только из списка)
  @IsString({ message: 'Тип операции должен быть строкой' })
  @IsNotEmpty({ message: 'Тип операции не может быть пустым' })
  @IsIn(['hire', 'change_salary', 'change_department', 'dismissal'], {
    message: 'Тип операции должен быть: hire, change_salary, change_department или dismissal'
  })
  operation_type: string;

  // ID отдела
  @IsOptional()
  @IsInt({ message: 'department_id должен быть числом' })
  department_id?: number;

  // ID должности
  @IsOptional()
  @IsInt({ message: 'position_id должен быть числом' })
  position_id?: number;

  // Новая зарплата
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Зарплата должна быть числом с 2 знаками после запятой' })
  salary?: number;

  // Дата операции (обязательное поле)
  @IsDate({ message: 'Дата операции должна быть корректной датой' })
  @IsNotEmpty({ message: 'Дата операции не может быть пустой' })
  @Transform(({ value }) => value ? new Date(value) : undefined)
  operation_date: Date;
}