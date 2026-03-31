import { IsString, IsNotEmpty, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreatePositionDto {
  @IsString({ message: 'Название должно быть строкой' })
  @IsNotEmpty({ message: 'Название не может быть пустым' })
  @MaxLength(255, { message: 'Название не может превышать 255 символов' })
  @Transform(({ value }) => value?.trim())
  name: string;
}