import { IsString, IsOptional, MaxLength } from 'class-validator';

/**
 * Объект данных для создания новой организации (для валидации входящего запроса)
 */

export class CreateOrganizationDto {
  @IsString({ message: 'Название должно быть строкой' })
  @MaxLength(255, { message: 'Название не может превышать 255 символов' })
  name: string;

  @IsOptional()
  @IsString({ message: 'Комментарий должен быть строкой' })
  comment?: string;
}