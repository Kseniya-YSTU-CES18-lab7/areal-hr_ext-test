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
    this.logger.log(`User logged in: ${req.user.login} (role: ${req.user.role})`);
    // req.user уже очищен от пароля в AuthService.validateUser
    return req.user as UserResponseDto;
  }

  /**
   * Выход из системы (на клиенте удаляем токен/данные)
   * На сервере сессии не хранятся (stateless), (просто +)
   */
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(): { message: string } {
    return { message: 'Выход выполнен успешно' };
  }
}