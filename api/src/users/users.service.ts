import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, Brackets } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthService } from '../auth/auth.service';
import { HistoryService } from '../history/history.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private repo: Repository<User>,
    private authService: AuthService,
    private historyService: HistoryService,
  ) {}

  // Поиск по логину ИЛИ фамилии ИЛИ имени ИЛИ отчеству
  async findAll(
    search?: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{ data: User[]; total: number; page: number; limit: number }> {  
    
    const query = this.repo.createQueryBuilder('user')
      .where('user.deletedAt IS NULL');
    
    if (search && search.trim()) {
      const searchTerm = `%${search.trim()}%`;
      
      query.andWhere(
        new Brackets(qb => {
          qb.where('user.login ILIKE :search', { search: searchTerm })
            .orWhere('user.surname ILIKE :search', { search: searchTerm })
            .orWhere('user.firstName ILIKE :search', { search: searchTerm })  
            .orWhere('user.patronymic ILIKE :search', { search: searchTerm });
        })
      );
    }

    const [data, total] = await query
      .select([
        'user.id',
        'user.surname',
        'user.firstName', 
        'user.patronymic',
        'user.login',
        'user.role',
        'user.createdAt',
        'user.updatedAt'
      ])
      .orderBy('user.surname', 'ASC')
      .addOrderBy('user.firstName', 'ASC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total, page, limit };
  }

  async findOne(id: string): Promise<User> {
    const user = await this.repo.findOne({
      where: { id, deletedAt: IsNull() },
      select: ['id', 'surname', 'firstName', 'patronymic', 'login', 'role', 'createdAt', 'updatedAt'],
    });

    if (!user) {
      throw new NotFoundException(`Пользователь с id ${id} не найден`);
    }
    return user;
  }

  async create(dto: CreateUserDto): Promise<User> {
    return await this.authService.create(dto);
  }

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    if (dto.login && dto.login !== user.login) {
      const existing = await this.repo.findOne({
        where: { login: dto.login, deletedAt: IsNull() },
      });
      if (existing) {
        throw new ConflictException(`Пользователь с логином "${dto.login}" уже существует`);
      }
      await this.historyService.create({
        userId: 'system',
        entityType: 'User',
        entityId: id,
        fieldName: 'login',
        oldValue: user.login,
        newValue: dto.login,
        operationType: 'update',
      });
    }

    if (dto.surname && dto.surname !== user.surname) {
      await this.historyService.create({
        userId: 'system',
        entityType: 'User',
        entityId: id,
        fieldName: 'surname',
        oldValue: user.surname,
        newValue: dto.surname,
        operationType: 'update',
      });
    }

    if (dto.firstName && dto.firstName !== user.firstName) {
      await this.historyService.create({
        userId: 'system',
        entityType: 'User',
        entityId: id,
        fieldName: 'firstName',
        oldValue: user.firstName,
        newValue: dto.firstName,
        operationType: 'update',
      });
    }

    if (dto.patronymic !== undefined && dto.patronymic !== user.patronymic) {
      await this.historyService.create({
        userId: 'system',
        entityType: 'User',
        entityId: id,
        fieldName: 'patronymic',
        oldValue: user.patronymic ?? undefined,
        newValue: dto.patronymic,
        operationType: 'update',
      });
    }

    if (dto.role && dto.role !== user.role) {
      await this.historyService.create({
        userId: 'system',
        entityType: 'User',
        entityId: id,
        fieldName: 'role',
        oldValue: user.role,
        newValue: dto.role,
        operationType: 'update',
      });
    }

    if (dto.password) {
      dto.password = await this.authService.hashPassword(dto.password);
    }

    await this.repo.update(id, { ...dto, updatedAt: new Date() });
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    
    await this.historyService.create({
      userId: 'system',
      entityType: 'User',
      entityId: id,
      fieldName: 'deletedAt',
      oldValue: undefined,
      newValue: new Date().toISOString(),
      operationType: 'delete',
    });
    
    await this.repo.update(id, { deletedAt: new Date() });
  }

  async restore(id: string): Promise<void> {
    await this.historyService.create({
      userId: 'system',
      entityType: 'User',
      entityId: id,
      fieldName: 'deletedAt',
      oldValue: new Date().toISOString(),
      newValue: undefined,
      operationType: 'update',
    });
    
    await this.repo.update(id, { deletedAt: null });
  }
}