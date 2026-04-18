import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeesController } from './employees.controller';
import { EmployeesService } from './employees.service';
import { Employee } from './entities/employee.entity';
import { Passport } from '../passports/entities/passport.entity';
import { Address } from '../addresses/entities/address.entity';
import { HistoryModule } from '../history/history.module';

/**
 * Модуль сотрудников (Employees)
 */
@Module({
  imports: [TypeOrmModule.forFeature([Employee, Passport, Address]), HistoryModule],
  controllers: [EmployeesController],
  providers: [EmployeesService],
  exports: [EmployeesService],
})
export class EmployeesModule {}