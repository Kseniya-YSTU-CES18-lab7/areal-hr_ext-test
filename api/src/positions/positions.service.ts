import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Position } from './entities/position.entity';
import { CreatePositionDto } from './dto/create-position.dto';
import { UpdatePositionDto } from './dto/update-position.dto';

/**
 * Сервис для управления должностями (реализует бизнес-логику CRUD-операций с учетом мягкого удаления)
 */

@Injectable()
export class PositionsService {
  constructor(
    @InjectRepository(Position)
    private readonly repo: Repository<Position>,
  ) {}

  async create(dto: CreatePositionDto): Promise<Position> {
    const existing = await this.repo.findOne({
      where: { name: dto.name, deleted_at: IsNull() },
    });
    if (existing) {
      throw new ConflictException(`Должность "${dto.name}" уже существует`);
    }
    return await this.repo.save(this.repo.create(dto));
  }

  async findAll(): Promise<Position[]> {
    return await this.repo.find({
      where: { deleted_at: IsNull() },
      order: { name: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Position> {
    const position = await this.repo.findOne({
      where: { id, deleted_at: IsNull() },
    });
    if (!position) {
      throw new NotFoundException(`Должность с id ${id} не найдена`);
    }
    return position;
  }

  async update(id: number, dto: UpdatePositionDto): Promise<Position> {
    const position = await this.findOne(id);

    if (dto.name && dto.name !== position.name) {
      const existing = await this.repo.findOne({
        where: { name: dto.name, deleted_at: IsNull() },
      });
      if (existing) {
        throw new ConflictException(`Должность "${dto.name}" уже существует`);
      }
    }

    await this.repo.update(id, { ...dto, updated_at: new Date() });
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    // Проверяем существование и активность записи перед удалением
    await this.findOne(id);
    await this.repo.update(id, { deleted_at: new Date() });
  }

  async restore(id: number): Promise<void> {
    // Восстанавление ранее мягко удаленной должности
    await this.repo.update(id, { deleted_at: null });
  }
}