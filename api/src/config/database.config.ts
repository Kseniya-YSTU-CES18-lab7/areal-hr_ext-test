import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

// Конфигурация подключения к PostgreSQL
// Использует переменные окружения из .env файла

export default registerAs(
  'database',  // ← пространство имён для группировки
  (): TypeOrmModuleOptions => ({
    type: 'postgres',
    
    // Параметры подключения (берём из .env или используем значения по умолчанию)
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'areal_hr',
    
    // Настройки TypeORM
    autoLoadEntities: true,      
    synchronize: false,          
    migrationsRun: true,         
    migrationsTableName: 'migrations',
    migrations: ['dist/migrations/*.js'],
  }),
);