import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { AuthService } from '../auth/auth.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const authService = app.get(AuthService);
  
  try {
    await authService.create({
      surname: 'Администратор',
      firstName: 'Системный',
      patronymic: undefined,  
      login: 'admin',
      password: 'Admin@123',
      role: 'admin',
    });
    console.log('✅ Администратор создан: login=admin, password=Admin@123');
  } catch (error: any) {
    if (error.message?.includes('уже существует')) {
      console.log('⚠️  Администратор уже существует');
    } else {
      console.error('❌ Ошибка создания админа:', error.message);
    }
  } finally {
    await app.close();
  }
}

bootstrap();