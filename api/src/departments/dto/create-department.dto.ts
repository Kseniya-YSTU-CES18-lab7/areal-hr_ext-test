import { IsString, IsOptional, IsInt, IsPositive, MaxLength, IsNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateDepartmentDto {
  @IsInt({ message: 'organizationId должен быть числом' })
  @IsPositive({ message: 'organizationId должен быть положительным' })
  organizationId!: number;

  @IsOptional()
  @IsInt({ message: 'parentId должен быть числом' })
  @IsPositive({ message: 'parentId должен быть положительным' })
  parentId?: number | null;

  @IsString({ message: 'Название должно быть строкой' })
  @IsNotEmpty({ message: 'Название не может быть пустым' })
  @MaxLength(255, { message: 'Название не может превышать 255 символов' })
  @Transform(({ value }) => value?.trim())
  name!: string;

  @IsOptional()
  @IsString({ message: 'Комментарий должен быть строкой' })
  @MaxLength(1000, { message: 'Комментарий не может превышать 1000 символов' })
  @Transform(({ value }) => value?.trim())
  comment?: string | null;
}