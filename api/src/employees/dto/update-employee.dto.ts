import { PartialType } from '@nestjs/mapped-types';
import { CreateEmployeeDto } from './create-employee.dto';
/**
 * DTO для обновления сотрудника
 */
export class UpdateEmployeeDto extends PartialType(CreateEmployeeDto) {}