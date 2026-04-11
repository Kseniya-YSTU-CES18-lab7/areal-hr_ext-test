import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeesController } from './employees.controller';
import { EmployeesService } from './employees.service';
import { Employee } from './entities/employee.entity';
import { HistoryModule } from '../history/history.module';

/**
 * Модуль сотрудников (Employees)
 */
@Module({
  imports: [TypeOrmModule.forFeature([Employee]), HistoryModule],
  controllers: [EmployeesController],
  providers: [EmployeesService],
  exports: [EmployeesService],
})
export class EmployeesModule {}