import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, BadRequestException, ClassSerializerInterceptor } from '@nestjs/common';
import { DatabaseExceptionFilter } from './filters/database-exception.filter';
import session from 'express-session';
import passport from 'passport';
import cookieParser from 'cookie-parser';  

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // CORS
  app.enableCors({
    origin: 'http://localhost:9000',  
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,  
    allowedHeaders: 'Content-Type, Authorization',
  });
  
  app.use(cookieParser());  
  
  // Сессии
  app.use(
    session({
      secret: process.env.SESSION_SECRET || 'dev-secret-change-in-prod',
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: false,  
        httpOnly: true,
        sameSite: 'lax',
        path: '/',     
        maxAge: 24 * 60 * 60 * 1000,
      },
    })
  );
  
  // PASSPORT
  app.use(passport.initialize());
  app.use(passport.session());

  // Глобальный ValidationPipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors) => {
        console.log('❌ Validation errors:', JSON.stringify(errors, null, 2));
        return new BadRequestException(errors);
      },
    }),
  );
  
  // Глобальный фильтр ошибок базы данных
  app.useGlobalFilters(new DatabaseExceptionFilter());
  
  // Глобальный сериализатор
  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(app.get(Reflector), {
      //strategy: 'excludeAll',
    })
  );
  
  try {
    await app.listen(3000);
    console.log('✅ Сервер запущен на порту 3000');
  } catch (error) {
    console.error('❌ Ошибка запуска сервера:', error);
    process.exit(1);
  }
}
bootstrap();