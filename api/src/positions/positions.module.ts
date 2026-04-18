import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PositionsController } from './positions.controller';
import { PositionsService } from './positions.service';
import { Position } from './entities/position.entity';
import { HistoryModule } from '../history/history.module';

/**
 * Модуль Должности (Positions) (Инкапсулирует всю бизнес-логику, связанную с управлением должностями)
*/

@Module({
  imports: [
    TypeOrmModule.forFeature([Position]),
    HistoryModule,
  ],
  controllers: [PositionsController],
  providers: [PositionsService],
  exports: [PositionsService],
})
export class PositionsModule {}