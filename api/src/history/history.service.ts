import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { History } from './entities/history.entity';
import { CreateHistoryDto } from './dto/create-history.dto';

/**
 * Сервис для работы с историей изменений
 * Т. к. история — это лог событий, записи не изменяются и не удаляются, поэтому методов update, remove, restore нет.
 */
@Injectable()
export class HistoryService {
  private readonly logger = new Logger(HistoryService.name);

  constructor(
    @InjectRepository(History)
    private readonly repo: Repository<History>,
  ) {}

  // Создание записи в истории
  async create(dto: CreateHistoryDto): Promise<History> {
    this.logger.log(`Creating history record: ${dto.operation_type} for ${dto.entity_type}`);
    const history = this.repo.create(dto);
    return await this.repo.save(history);
  }

  // Получение последних 100 записей истории (сортировка от новых к старым)
  async findAll(): Promise<History[]> {
    this.logger.log('Finding all history records');
    return await this.repo.find({
      order: { created_at: 'DESC' },
      take: 100,
    });
  }

  // Получение истории по типу и ID сущности
  async findByEntity(entityType: string, entityId: string): Promise<History[]> {
    this.logger.log(`Finding history for ${entityType}: ${entityId}`);
    return await this.repo.find({
      where: { entity_type: entityType, entity_id: entityId },
      order: { created_at: 'DESC' },
    });
  }

  // Получение истории по ID пользователя
  async findByUserId(userId: string): Promise<History[]> {
    this.logger.log(`Finding history for user: ${userId}`);
    return await this.repo.find({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
    });
  }

  // Получение записи истории по ID
  async findOne(id: number): Promise<History> {
    this.logger.log(`Finding history record by id: ${id}`);
    const history = await this.repo.findOne({
      where: { id },
    });
    if (!history) {
      throw new NotFoundException(`Запись истории с id ${id} не найдена`);
    }
    return history;
  }
}