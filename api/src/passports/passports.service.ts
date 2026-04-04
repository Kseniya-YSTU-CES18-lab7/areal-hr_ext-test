import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Passport } from './entities/passport.entity';
import { CreatePassportDto } from './dto/create-passport.dto';
import { UpdatePassportDto } from './dto/update-passport.dto';

/**
 * Сервис для работы с паспортными данными
 * Связь с сотрудником: 1:1
 */
@Injectable()
export class PassportsService {
  private readonly logger = new Logger(PassportsService.name);

  constructor(
    @InjectRepository(Passport)
    private readonly repo: Repository<Passport>,
  ) {}

  // Создание паспорта (если у сотрудника ещё нет паспорта)
  async create(dto: CreatePassportDto): Promise<Passport> {
    this.logger.log(`Creating passport for employee: ${dto.employeeId}`);
    
    const existing = await this.repo.findOne({
      where: { employeeId: dto.employeeId, deletedAt: IsNull() },
    });
    if (existing) {
      throw new NotFoundException('У сотрудника уже есть паспорт');
    }

    const passport = this.repo.create(dto);
    return await this.repo.save(passport);
  }

  // Получение всех активных паспортов
  async findAll(): Promise<Passport[]> {
    this.logger.log('Finding all passports');
    return await this.repo.find({
      where: { deletedAt: IsNull() },
      relations: ['employee'],
    });
  }

  // Получение паспорта по ID
  async findOne(id: number): Promise<Passport> {
    this.logger.log(`Finding passport by id: ${id}`);
    const passport = await this.repo.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['employee'],
    });
    if (!passport) {
      throw new NotFoundException(`Паспорт с id ${id} не найден`);
    }
    return passport;
  }

  // Получение паспорта по ID сотрудника
  async findByEmployeeId(employeeId: string): Promise<Passport> {
    this.logger.log(`Finding passport by employee_id: ${employeeId}`);
    const passport = await this.repo.findOne({
      where: { employeeId: employeeId, deletedAt: IsNull() },
      relations: ['employee'],
    });
    if (!passport) {
      throw new NotFoundException(`Паспорт для сотрудника ${employeeId} не найден`);
    }
    return passport;
  }

  // Обновление паспорта
  async update(id: number, dto: UpdatePassportDto): Promise<Passport> {
    this.logger.log(`Updating passport: ${id}`);
    await this.findOne(id);
    await this.repo.update(id, { ...dto });
    return await this.findOne(id);
  }

  // Мягкое удаление паспорта
  async remove(id: number): Promise<void> {
    this.logger.log(`Soft deleting passport: ${id}`);
    await this.findOne(id);
    await this.repo.update(id, { deletedAt: new Date() });
  }

  // Восстановление паспорта
  async restore(id: number): Promise<void> {
    this.logger.log(`Restoring passport: ${id}`);
    await this.repo.update(id, { deletedAt: null });
  }
}