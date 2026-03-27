import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import databaseConfig from './config/database.config';

@Module({
  imports: [ // 1. Конфигурация из .env файла
    ConfigModule.forRoot({
      isGlobal: true,          // ConfigService будет доступен везде
      envFilePath: ['.env'],   // .env в корне проекта
      load: [databaseConfig],  // загружаем наш конфиг БД
    }),

    // 2. Подключение TypeORM к PostgreSQL
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService): TypeOrmModuleOptions => {
        const config = configService.get<TypeOrmModuleOptions>('database');
        if (!config) {
          throw new Error('Database configuration not found');
        }
        return config;
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
