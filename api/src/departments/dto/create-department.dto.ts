import { IsString, IsOptional, IsInt, IsPositive, MaxLength } from 'class-validator';

/**
 * DTO для создания отдела
 */
export class CreateDepartmentDto {
  @IsInt({ message: 'organization_id должен быть числом' })
  @IsPositive({ message: 'organization_id должен быть положительным числом' })
  organization_id: number;

  @IsOptional()
  @IsInt({ message: 'parent_id должен быть числом' })
  @IsPositive({ message: 'parent_id должен быть положительным числом' })
  parent_id?: number | null;

  @IsString({ message: 'Название должно быть строкой' })
  @MaxLength(255, { message: 'Название не может превышать 255 символов' })
  name: string;

  @IsOptional()
  @IsString({ message: 'Комментарий должен быть строкой' })
  comment?: string | null;
}