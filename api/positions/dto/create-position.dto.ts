import { IsString, IsOptional, MaxLength } from 'class-validator';

export class CreatePositionDto {
  @IsString({ message: 'Название должно быть строкой' })
  @MaxLength(255, { message: 'Название не может превышать 255 символов' })
  name: string;
}