import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DepartmentsController } from './departments.controller';
import { DepartmentsService } from './departments.service';
import { Department } from './entities/department.entity';

/**
 * Модуль Отделы (Вся логика связанная с управлением отделами)
 */
@Module({
  imports: [TypeOrmModule.forFeature([Department])],
  controllers: [DepartmentsController],
  providers: [DepartmentsService],
// Экспортируем сервис, чтобы другие модули могли использовать его для связи сотрудников с их отделами
  exports: [DepartmentsService],
})
export class DepartmentsModule {}