// FILE: src/organizations/organizations.service.ts
import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, Like } from 'typeorm';
import { Organization } from './entities/organization.entity';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { HistoryService } from '../history/history.service';

/**
 * Сервис для работы с организациями (CRUD + мягкое удаление + история изменений)
 */
@Injectable()
export class OrganizationsService {
  private readonly logger = new Logger(OrganizationsService.name);

  constructor(
    @InjectRepository(Organization)
    private readonly repo: Repository<Organization>,
    private readonly historyService: HistoryService,
  ) {}

  // Метод для записи в историю
  private async logChange(
    organizationId: number,
    fieldName: string,
    oldValue: any,
    newValue: any,
    operationType: 'create' | 'update' | 'delete',
    userId: string = 'system',
  ) {
    try {
      await this.historyService.create({
        userId,
        entityType: 'Organization',
        entityId: organizationId.toString(),
        fieldName,
        oldValue: oldValue?.toString() ?? null,
        newValue: newValue?.toString() ?? null,
        operationType,
      });
    } catch (err: any) {
      this.logger.warn(`Failed to log history: ${err.message}`);
    }
  }

  /**
   * Создать новую организацию
   */
  async create(dto: CreateOrganizationDto): Promise<Organization> {
    const existing = await this.repo.findOne({
      where: { name: dto.name, deletedAt: IsNull() },
    });

    if (existing) {
      throw new ConflictException(`Организация "${dto.name}" уже существует`);
    }

    const organization = this.repo.create(dto);
    const saved = await this.repo.save(organization);

    // Логирование создания (без DEBUG)
    this.logger.log(`Organization created: ${saved.id} - ${saved.name}`);

    // История изменений
    await this.logChange(saved.id, 'organization', null, saved, 'create');

    return saved;
  }

  /**
   * Получить все активные организации (с поиском и пагинацией)
   */
  async findAll(
    search?: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{ data: Organization[]; total: number; page: number; limit: number }> {
    this.logger.log(`Finding organizations: page=${page}, limit=${limit}, search=${search}`);
    const where: any = { deletedAt: IsNull() };

    // Поиск через ILike
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

    return {
      data,
      total,
      page,
      limit,
    };
  }

  /**
   * Получить организацию по ID
   */
  async findOne(id: number): Promise<Organization> {
    const organization = await this.repo.findOne({
      where: { id, deletedAt: IsNull() },
    });
    if (!organization) {
      throw new NotFoundException(`Организация с id ${id} не найдена`);
    }
    return organization;
  }

  /**
   * Обновить организацию
   */
  async update(id: number, dto: UpdateOrganizationDto): Promise<Organization> {
    const organization = await this.findOne(id);

    // Логирование изменений по каждому полю
    if (dto.name && dto.name !== organization.name) {
      await this.logChange(id, 'name', organization.name, dto.name, 'update');
    }
    if (dto.comment !== undefined && dto.comment !== organization.comment) {
      await this.logChange(id, 'comment', organization.comment, dto.comment, 'update');
    }

    await this.repo.update(id, {
      ...dto,
      updatedAt: new Date(),
    });

    this.logger.log(`Organization updated: ${id}`);

    return this.findOne(id);
  }

  /**
   * Мягкое удаление организации
   */
  async remove(id: number): Promise<void> {
    const organization = await this.findOne(id);

    // Логирование удаления
    await this.logChange(id, 'deletedAt', null, new Date(), 'delete');

    await this.repo.update(id, { deletedAt: new Date() });

    this.logger.log(`Organization soft deleted: ${id}`);
  }

  /**
   * Восстановить удалённую организацию
   */
  async restore(id: number): Promise<void> {
    await this.repo.update(id, { deletedAt: null });
    this.logger.log(`Organization restored: ${id}`);
  }
}