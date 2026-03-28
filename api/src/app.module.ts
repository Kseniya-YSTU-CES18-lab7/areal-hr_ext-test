import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import databaseConfig from './config/database.config';

@Module({
  imports: [ // Конфигурация из .env файла
    ConfigModule.forRoot({
      isGlobal: true,          
      envFilePath: ['.env'],   
      load: [databaseConfig],  
    }),

    // Подключение TypeORM к PostgreSQL
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const db = config.get('database');
        if (!db) throw new Error('DB config missing');
        return db;
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
