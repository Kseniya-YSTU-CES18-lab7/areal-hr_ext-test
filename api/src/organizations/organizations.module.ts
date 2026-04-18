import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrganizationsController } from './organizations.controller';
import { OrganizationsService } from './organizations.service';
import { Organization } from './entities/organization.entity';
import { HistoryModule } from '../history/history.module';

/**
 * Модуль Organizations (Инкапсулирует всю логику, связанную с управлением организациями)
 */
@Module({
  imports: [TypeOrmModule.forFeature([Organization]), HistoryModule,
],
  controllers: [OrganizationsController],
  providers: [OrganizationsService],
  exports: [OrganizationsService], // нужно чтобы другие модули могли использовать сервис
})
export class OrganizationsModule {}