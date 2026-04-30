import { 
  Controller, 
  Post, 
  Body, 
  UseGuards, 
  Request, 
  HttpCode, 
  HttpStatus,
  Logger 
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { LoginUserDto } from '../users/dto/login-user.dto';
import { UserResponseDto } from '../users/dto/user.response.dto';
import { SessionGuard } from '../common/guards/session.guard';  

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  /**
   * Аутентификация пользователя
   * POST /auth/login
   */
  @UseGuards(AuthGuard('local'))
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Request() req, @Body() dto: LoginUserDto): Promise<UserResponseDto> {
    this.logger.log(`User validated: ${req.user?.login}`);
    
    // Сохраняем пользователя в сессию!    
    await new Promise<void>((resolve, reject) => {
      req.login(req.user, { session: true }, (err) => {
        if (err) {
          this.logger.error('❌ req.login error:', err);
          reject(err);
        } else {
          this.logger.debug('✅ req.login success, user serialized to session');
          resolve();
        }
      });
    });
    
    this.logger.log(`✅ User logged in and session established: ${req.user.login} (role: ${req.user.role})`);
    return req.user as UserResponseDto;
  }

  /**
   * Выход из системы
   */
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(SessionGuard)
  async logout(@Request() req): Promise<{ message: string }> {
    // Уничтожаем сессию
    req.logout((err) => {
      if (err) this.logger.error('Logout error:', err);
    });
    req.session.destroy();
    return { message: 'Выход выполнен успешно' };
  }
}