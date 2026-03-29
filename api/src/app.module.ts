import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import databaseConfig from './config/database.config';
import { OrganizationsModule } from './organizations/organizations.module';
import { PositionsModule } from './positions/positions.module';

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
      useFactory: (config: ConfigService): TypeOrmModuleOptions => {
        // Проверка что конфиг существует
        const dbConfig = config.get<TypeOrmModuleOptions>('database');
        
        if (!dbConfig) {
          throw new Error('Ошибка: конфигурация базы данных не найдена. Проверь .env файл');
        }
        
        return dbConfig;
      },
    }),

    OrganizationsModule,
    PositionsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
