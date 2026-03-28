// api/src/organizations/dto/update-organization.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateOrganizationDto } from './create-organization.dto';

/**
 * DTO для обновления организации
 */
export class UpdateOrganizationDto extends PartialType(CreateOrganizationDto) {}