import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, BadRequestException } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Включаем CORS (разрешаем запросы с фронтенда)
  app.enableCors({
    origin: 'http://localhost:9000',  // Разрешаем только наш фронтенд
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',  // Разрешённые методы
    credentials: true,  // Разрешаем отправку cookies/токенов
    allowedHeaders: 'Content-Type, Authorization',  // Разрешённые заголовки
  });
  
  await app.listen(3000);
}
bootstrap();
