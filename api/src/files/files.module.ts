import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';
import { File } from './entities/file.entity';
import { HistoryModule } from '../history/history.module';
import { multerConfig } from '../config/multer.config';

/**
 * Модуль файлов (Files)
 * Связь с сотрудником: N:1 (у одного сотрудника может быть много файлов)
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([File]),
    MulterModule.register(multerConfig),
    HistoryModule,
  ],
  controllers: [FilesController],
  providers: [FilesService],
  exports: [FilesService],
})
export class FilesModule {}