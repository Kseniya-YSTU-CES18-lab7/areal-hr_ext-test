import { PartialType } from '@nestjs/mapped-types';
import { CreateDepartmentDto } from './create-department.dto';

/**
 * DTO для обновления отдела
 */
export class UpdateDepartmentDto extends PartialType(CreateDepartmentDto) {}