import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HrOperationsController } from './hr-operations.controller';
import { HrOperationsService } from './hr-operations.service';
import { HrOperation } from './entities/hr-operation.entity';

/**
 * Модуль кадровых операций (HrOperations)
 * Типы операций: hire, change_salary, change_department, dismissal
 */
@Module({
  imports: [TypeOrmModule.forFeature([HrOperation])],
  controllers: [HrOperationsController],
  providers: [HrOperationsService],
  exports: [HrOperationsService],
})
export class HrOperationsModule {}