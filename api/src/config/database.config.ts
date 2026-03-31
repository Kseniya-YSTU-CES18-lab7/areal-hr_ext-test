import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

// Конфигурация подключения к PostgreSQL
// Использует переменные окружения из .env файла

export default registerAs(
  'database',  
  (): TypeOrmModuleOptions => {
    const dbHost = process.env.DB_HOST ?? '127.0.0.1';
    const dbPort = parseInt(process.env.DB_PORT ?? '5434', 10);
    const dbUser = process.env.DB_USERNAME;
    const dbPass = process.env.DB_PASSWORD;
    const dbName = process.env.DB_NAME;

    // Валидация
    if (!dbUser || !dbPass || !dbName) {
      throw new Error(
        '- ! Ошибка конфигурации БД: нужно проверить файл .env.\n' +
        'Обязательные переменные: DB_USERNAME, DB_PASSWORD, DB_NAME'
      );
    }
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
    };
  },
);