import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DepartmentsController } from './departments.controller';
import { DepartmentsService } from './departments.service';
import { Department } from './entities/department.entity';
import { HistoryModule } from '../history/history.module'

/**
 * Модуль Отделы (Вся логика связанная с управлением отделами)
 */
@Module({
  imports: [TypeOrmModule.forFeature([Department]),
  HistoryModule,
  ],
  controllers: [DepartmentsController],
  providers: [DepartmentsService],
// Экспортируем сервис, чтобы другие модули могли использовать его для связи сотрудников с их отделами
  exports: [DepartmentsService],
})
export class DepartmentsModule {}