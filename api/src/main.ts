import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, BadRequestException, ClassSerializerInterceptor } from '@nestjs/common';
import { DatabaseExceptionFilter } from './filters/database-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // CORS (+)
  app.enableCors({
    // origin: 'http://localhost:9000',
    origin: ['http://localhost:9000', 'http://localhost:3000'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: 'Content-Type, Authorization',
  });
  
  // Глобальный ValidationPipe (для валидации входящих DTO)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,              // удаляет поля, которых нет в DTO
      forbidNonWhitelisted: true,  // бросает ошибку при лишних полях
      transform: true,              // автоматически преобразует типы
      exceptionFactory: (errors) => new BadRequestException(errors),
    }),
  );
  
  // Глобальный фильтр ошибок базы данных
  app.useGlobalFilters(new DatabaseExceptionFilter());
  
  // Глобальный сериализатор (преобразует Entity - Response DTO)
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  
  await app.listen(3000);
}
bootstrap();