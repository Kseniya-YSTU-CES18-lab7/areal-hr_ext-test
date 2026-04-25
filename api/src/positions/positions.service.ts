import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, Like } from 'typeorm';
import { Position } from './entities/position.entity';
import { CreatePositionDto } from './dto/create-position.dto';
import { UpdatePositionDto } from './dto/update-position.dto';
import { HistoryService } from '../history/history.service';

/**
 * Сервис для управления должностями (реализует бизнес-логику CRUD-операций с учетом мягкого удаления)
 */
@Injectable()
export class PositionsService {
  private readonly logger = new Logger(PositionsService.name);

  constructor(
    @InjectRepository(Position)
    private readonly repo: Repository<Position>,
    private readonly historyService: HistoryService,
  ) {}

  private async logChange(
  positionId: number,
  fieldName: string,
  oldValue: any,
  newValue: any,
  operationType: 'create' | 'update' | 'delete',
  userId: string = '00000000-0000-4000-8000-000000000000',
) {
  try {
    await this.historyService.create({
      userId,
      entityType: 'Position',
      entityId: positionId.toString(),
      fieldName,
      oldValue: oldValue?.toString() ?? null,
      newValue: newValue?.toString() ?? null,
      operationType,
    });
    this.logger.log(`✅ History logged: ${fieldName} for position ${positionId}`);
  } catch (err: any) {
    this.logger.error(`✗ Failed to log history for position ${positionId}, field ${fieldName}: ${err.message}`, err.stack);
    if (process.env.NODE_ENV === 'development') {
      throw err;
    }
  }
}

  async create(dto: CreatePositionDto): Promise<Position> {
    this.logger.log(`Creating position: ${dto.name}`);
    const existing = await this.repo.findOne({
      where: { name: dto.name, deletedAt: IsNull() },
    });
    if (existing) {
      throw new ConflictException(`Должность "${dto.name}" уже существует`);
    }
    const saved = await this.repo.save(this.repo.create(dto));
    await this.logChange(saved.id, 'position', null, JSON.stringify(saved), 'create');
    return saved;
  }

  async findAll(
  search?: string,
  page: number = 1,
  limit: number = 20
): Promise<{ data: Position[]; total: number; page: number; limit: number }> {
  this.logger.log(`Finding all positions with pagination: page=${page}, limit=${limit}, search=${search}`);
  
  const where: any = { deletedAt: IsNull() };
  
  if (search) {
    where.name = Like(`%${search}%`);
  }
  
  const total = await this.repo.count({ where });
  const data = await this.repo.find({
    where,
    order: { name: 'ASC' },
    skip: (page - 1) * limit,
    take: limit,
  });
  
  return { data, total, page, limit };
}

  async findOne(id: number): Promise<Position> {
    this.logger.log(`Finding position by id: ${id}`);
    const position = await this.repo.findOne({
      where: { id, deletedAt: IsNull() },
    });
    if (!position) {
      throw new NotFoundException(`Должность с id ${id} не найдена`);
    }
    return position;
  }

  async update(id: number, dto: UpdatePositionDto): Promise<Position> {
    this.logger.log(`Updating position: ${id}`);
    const position = await this.findOne(id);

    if (dto.name && dto.name !== position.name) {
      const existing = await this.repo.findOne({
        where: { name: dto.name, deletedAt: IsNull() },
      });
      if (existing) {
        throw new ConflictException(`Должность "${dto.name}" уже существует`);
      }
      await this.logChange(id, 'name', JSON.stringify(position.name), JSON.stringify(dto.name), 'update');
    }

    await this.repo.update(id, { ...dto, updatedAt: new Date() });
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    this.logger.log(`Soft deleting position: ${id}`);
    await this.findOne(id);
    await this.logChange(id, 'deletedAt', null, JSON.stringify(new Date()), 'delete');
    await this.repo.update(id, { deletedAt: new Date() });
  }

  async restore(id: number): Promise<void> {
    this.logger.log(`Restoring position: ${id}`);
    await this.repo.update(id, { deletedAt: null });
  }
}