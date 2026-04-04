import { PartialType } from '@nestjs/mapped-types';
import { CreateHrOperationDto } from './create-hr-operation.dto';

export class UpdateHrOperationDto extends PartialType(CreateHrOperationDto) {}