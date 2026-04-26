import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import * as argon2 from 'argon2';
import { User } from '../users/entities/user.entity';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { HistoryService } from '../history/history.service';  // ← добавить

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepo: Repository<User>,
    private historyService: HistoryService,  // ← добавить
  ) {}

  async hashPassword(password: string): Promise<string> {
    return await argon2.hash(password, { type: argon2.argon2id });
  }

  async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return await argon2.verify(hashedPassword, plainPassword);
  }

  async validateUser(login: string, plainPassword: string): Promise<User | null> {
    const user = await this.usersRepo.findOne({
      where: { login, deletedAt: IsNull() },
      select: ['id', 'surname', 'firstName', 'patronymic', 'login', 'role', 'password', 'createdAt', 'updatedAt'],
    });

    if (!user) return null;

    const isPasswordValid = await this.verifyPassword(plainPassword, user.password);
    if (!isPasswordValid) return null;

    const { password, ...result } = user;
    return result as User;
  }

  async create(dto: CreateUserDto): Promise<User> {
    // Проверка на дубликат логина
    const existing = await this.usersRepo.findOne({
      where: { login: dto.login, deletedAt: IsNull() },
    });
    if (existing) {
      throw new Error(`Пользователь с логином "${dto.login}" уже существует`);
    }

    const hashedPassword = await this.hashPassword(dto.password);
    
    const user = this.usersRepo.create({
      surname: dto.surname,
      firstName: dto.firstName,
      patronymic: dto.patronymic ?? null,
      login: dto.login,
      password: hashedPassword,
      role: dto.role ?? 'manager',
    });

    const saved = await this.usersRepo.save(user);

    // Логирование создания пользователя в History
    await this.historyService.create({
      userId: 'system',
      entityType: 'User',
      entityId: saved.id,
      fieldName: 'create',
      oldValue: undefined,
      newValue: JSON.stringify({ login: saved.login, role: saved.role }),
      operationType: 'create',
    });

    return saved;
  }
}