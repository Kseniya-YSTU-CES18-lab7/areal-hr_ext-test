import { IsString, IsOptional, MaxLength, IsNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';

/**
 * Объект данных для создания новой организации (для валидации входящего запроса)
 */

export class CreateOrganizationDto {
  @IsString({ message: 'Название должно быть строкой' })
  @IsNotEmpty({ message: 'Название не может быть пустым' })
  @MaxLength(255, { message: 'Название не может превышать 255 символов' })
  @Transform(({ value }) => value?.trim()) 
  name: string;

  @IsOptional()
  @IsString({ message: 'Комментарий должен быть строкой' })
  @MaxLength(1000, { message: 'Комментарий не может превышать 1000 символов' })
  @Transform(({ value }) => value?.trim())
  comment?: string;
}