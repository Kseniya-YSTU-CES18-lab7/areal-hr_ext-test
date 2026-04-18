    import { Expose } from 'class-transformer';

/**
 * Response DTO для организации
 * Возвращает только публичные поля клиенту
 */
export class OrganizationResponseDto {
  @Expose()
  id!: number;

  @Expose()
  name!: string;

  @Expose()
  comment!: string | null;

  @Expose()
  createdAt!: Date;

  @Expose()
  updatedAt!: Date;

  // deletedAt НЕ экспонируем (т.к.это внутреннее поле)
}