import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { User } from '../users/entities/user.entity';
import { AuthService } from './auth.service';
import { LocalStrategy } from './local.strategy';
import { AuthController } from './auth.controller';
import { HistoryModule } from '../history/history.module';  

@Module({
  imports: [
    PassportModule,
    TypeOrmModule.forFeature([User]),
    HistoryModule,  // ← добавить
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy],
  exports: [AuthService],
})
export class AuthModule {}