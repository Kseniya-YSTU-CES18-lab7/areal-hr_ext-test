import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, BadRequestException } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Валидация с подробными ошибками (чтобы было легче проверять)
  app.useGlobalPipes(new ValidationPipe({ 
    transform: true,      // Автоматически преобразует payload в класс DTO
    whitelist: true,      // Удаляет лишние поля, которых нет в DTO
    forbidNonWhitelisted: true,  // Бросает ошибку, если есть лишние поля
    exceptionFactory: (errors) => {
      console.log('- Validation errors:', errors);  // ← Лог ошибок валидации
      return new BadRequestException(errors);
    }
  }));
  
  await app.listen(3000);
}
bootstrap();
