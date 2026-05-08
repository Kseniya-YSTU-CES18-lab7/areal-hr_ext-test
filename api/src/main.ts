import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, BadRequestException, ClassSerializerInterceptor } from '@nestjs/common';
import { DatabaseExceptionFilter } from './filters/database-exception.filter';
const session = require('express-session');
const passport = require('passport');
const cookieParser = require('cookie-parser');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.enableCors({
    origin: 'http://localhost:9000',  
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,  
    allowedHeaders: 'Content-Type, Authorization',
  });
  
  app.use(cookieParser()); 
  
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
  
  app.use(passport.initialize());
  app.use(passport.session());

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
  
  app.useGlobalFilters(new DatabaseExceptionFilter());
  
  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(app.get(Reflector), {}),
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