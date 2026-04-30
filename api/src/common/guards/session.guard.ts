import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, Logger } from '@nestjs/common';

/**
 * Guard для проверки сессии: просто проверяет, что user есть в request
 * (user добавляется автоматически через deserializeUser из сессии)
 */
@Injectable()
export class SessionGuard implements CanActivate {
  private readonly logger = new Logger(SessionGuard.name);

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    
    // Логируем всё, что есть в запросе для диагностики
    this.logger.debug('🔐 SessionGuard check:', {
      hasSession: !!request.session,
      sessionID: request.session?.id,
      hasUser: !!request.user,
      user: request.user ? { id: request.user.id, login: request.user.login, role: request.user.role } : null,
    });
    
    // Если user нет — сессия невалидна или не авторизован
    if (!request.user) {
      this.logger.warn('❌ Unauthorized: user not found in request');
      throw new UnauthorizedException('Требуется авторизация');
    }
    
    this.logger.log(`✅ Session authorized for user: ${request.user.login} (role: ${request.user.role})`);
    return true;
  }
}