import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

// Конфигурация подключения к PostgreSQL
// Использует переменные окружения из .env файла

export default registerAs(
  'database',  
  (): TypeOrmModuleOptions => {
    // Параметры подключения
    const dbHost = process.env.DB_HOST ?? '127.0.0.1';
    const dbPort = parseInt(process.env.DB_PORT ?? '5434', 10);
    const dbUser = process.env.DB_USERNAME ?? 'postgres';
    const dbPass = process.env.DB_PASSWORD ?? '';
    const dbName = process.env.DB_NAME ?? 'hr_management_db';

    return {
      type: 'postgres',
      host: dbHost,
      port: dbPort,
      username: dbUser,
      password: dbPass,
      database: dbName,
      
      // Настройки TypeORM
      autoLoadEntities: true,      
      synchronize: false,          
      migrationsRun: true,        
      migrationsTableName: 'pgmigrations', 
      migrations: ['dist/migrations/*.js'],
    };
  },
);