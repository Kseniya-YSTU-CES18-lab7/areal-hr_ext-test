import { PassportSerializer } from '@nestjs/passport';
import { Injectable, Logger } from '@nestjs/common';  
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { User } from '../users/entities/user.entity';

@Injectable()
export class SessionSerializer extends PassportSerializer {
  private readonly logger = new Logger(SessionSerializer.name);  

  constructor(
    @InjectRepository(User)
    private usersRepo: Repository<User>,
  ) {
    super();
  }

  // Сохраняем ТОЛЬКО строку с ID
  serializeUser(user: any, done: (err: Error | null, id: string) => void): any {
    this.logger.debug(`🔄 serializeUser called with user: ${user?.id} (login: ${user?.login})`);
    done(null, user.id);  
  }

  // Восстанавливаем пользователя по ID-строке
  async deserializeUser(
    userId: string,  
    done: (err: Error | null, user: any) => void,
  ): Promise<any> {
    this.logger.debug(`🔄 deserializeUser called with userId: ${userId}`);
    
    try {
      const user = await this.usersRepo.findOne({
        where: { id: userId, deletedAt: IsNull() },
        select: ['id', 'surname', 'firstName', 'patronymic', 'login', 'role', 'createdAt', 'updatedAt'],
      });
      
      if (user) {
        this.logger.debug(`🔄 deserializeUser result: user found - ${user.login} (${user.id})`);
      } else {
        this.logger.warn(`❌ User not found in DB for session userId: ${userId}`);
      }
      
      done(null, user);
    } catch (error) {
      this.logger.error(`❌ deserializeUser error: ${error}`);
      done(error as Error, null);
    }
  }
}