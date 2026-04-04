import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportsController } from './passports.controller';
import { PassportsService } from './passports.service';
import { Passport } from './entities/passport.entity';

/**
 * Модуль паспортных данных (Passports)
 */
@Module({
  imports: [TypeOrmModule.forFeature([Passport])],
  controllers: [PassportsController],
  providers: [PassportsService],
  exports: [PassportsService],
})
export class PassportsModule {}