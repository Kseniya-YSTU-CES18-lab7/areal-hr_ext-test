import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Organization } from './entities/organization.entity';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';

/**
 * Сервис для работы с организациями (реализует CRUD-операции с поддержкой мягкого удаления)
 */
@Injectable()
export class OrganizationsService {
  constructor(
    @InjectRepository(Organization)
    private readonly repo: Repository<Organization>,
  ) {}

  /**
   * Создать новую организацию
   */
async create(dto: CreateOrganizationDto): Promise<Organization> {
  console.log('Поиск [DEBUG] create() вызван с:', JSON.stringify(dto));
  
  try {
    const existing = await this.repo.findOne({
      where: { name: dto.name, deleted_at: IsNull() }
    });
    
    console.log('🔍 [DEBUG] existing:', existing);
    
    if (existing) {
      console.log('! [DEBUG] Дубликат!');
      throw new ConflictException(`Организация "${dto.name}" уже существует`);
    }

    const organization = this.repo.create(dto);
    console.log('Поиск [DEBUG] Перед save():', organization);
    
    const saved = await this.repo.save(organization);
    console.log('+ [DEBUG] После save():', saved);
    
    return saved;
  } catch (error) {
    console.error('- [DEBUG] Ошибка в create():', error.message);
    throw error;
  }
}

  /**
   * Получить все активные организации
   */
  async findAll(): Promise<Organization[]> {
    return await this.repo.find({
      where: { deleted_at: IsNull() },
      order: { name: 'ASC' }
    });
  }

  /**
   * Получить организацию по ID
   */
  async findOne(id: number): Promise<Organization> {
    const organization = await this.repo.findOne({
      where: { id, deleted_at: IsNull() }
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
    // Сначала проверяем, что организация существует и не удалена
    const organization = await this.findOne(id);

    // Если меняем название, то проверяем на дубликат
    if (dto.name && dto.name !== organization.name) {
      const existing = await this.repo.findOne({
        where: { name: dto.name, deleted_at: IsNull() }
      });
      if (existing) {
        throw new ConflictException(`Организация "${dto.name}" уже существует`);
      }
    }

    // Обновляем запись
    await this.repo.update(id, { 
      ...dto, 
      updated_at: new Date() 
    });

    return this.findOne(id);
  }

  /**
   * Пометить организацию как удалённую (мягкое удаление)
   */
  async remove(id: number): Promise<void> {
    const organization = await this.findOne(id); // проверит, что не удалена
    
    await this.repo.update(id, { 
      deleted_at: new Date() 
    });
  }

  /**
   * Восстановить удалённую организацию (понадобиться для администратора)
   */
  async restore(id: number): Promise<void> {
    await this.repo.update(id, { deleted_at: null });
  }
}