import { IsString, IsOptional, IsInt, IsPositive, MaxLength, IsNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateDepartmentDto {
  @IsInt({ message: 'organization_id должен быть числом' })
  @IsPositive({ message: 'organization_id должен быть положительным' })
  organization_id: number;

  @IsOptional()
  @IsInt({ message: 'parent_id должен быть числом' })
  @IsPositive({ message: 'parent_id должен быть положительным' })
  parent_id?: number | null;

  @IsString({ message: 'Название должно быть строкой' })
  @IsNotEmpty({ message: 'Название не может быть пустым' })
  @MaxLength(255, { message: 'Название не может превышать 255 символов' })
  @Transform(({ value }) => value?.trim())
  name: string;

  @IsOptional()
  @IsString({ message: 'Комментарий должен быть строкой' })
  @MaxLength(1000, { message: 'Комментарий не может превышать 1000 символов' })
  @Transform(({ value }) => value?.trim())
  comment?: string | null;
}