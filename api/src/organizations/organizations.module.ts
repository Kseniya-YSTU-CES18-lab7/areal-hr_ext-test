import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrganizationsController } from './organizations.controller';
import { OrganizationsService } from './organizations.service';
import { Organization } from './entities/organization.entity';

/**
 * Модуль Organizations (Инкапсулирует всю логику, связанную с управлением организациями)
 */
@Module({
  imports: [TypeOrmModule.forFeature([Organization])],
  controllers: [OrganizationsController],
  providers: [OrganizationsService],
  exports: [OrganizationsService], // нужно чтобы другие модули могли использовать сервис
})
export class OrganizationsModule {}