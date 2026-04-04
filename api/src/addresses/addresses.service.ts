import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Address } from './entities/address.entity';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

/**
 * Сервис для работы с адресами регистрации
 * Связь с сотрудником: 1:1
 */
@Injectable()
export class AddressesService {
  private readonly logger = new Logger(AddressesService.name);

  constructor(
    @InjectRepository(Address)
    private readonly repo: Repository<Address>,
  ) {}

  // Создание адреса (если у сотрудника ещё нет адреса)
  async create(dto: CreateAddressDto): Promise<Address> {
    this.logger.log(`Creating address for employee: ${dto.employee_id}`);
    
    const existing = await this.repo.findOne({
      where: { employee_id: dto.employee_id, deleted_at: IsNull() },
    });
    if (existing) {
      throw new NotFoundException('У сотрудника уже есть адрес');
    }

    const address = this.repo.create(dto);
    return await this.repo.save(address);
  }

  // Получение всех активных адресов
  async findAll(): Promise<Address[]> {
    this.logger.log('Finding all addresses');
    return await this.repo.find({
      where: { deleted_at: IsNull() },
      relations: ['employee'],
    });
  }

  // Получение адреса по ID
  async findOne(id: number): Promise<Address> {
    this.logger.log(`Finding address by id: ${id}`);
    const address = await this.repo.findOne({
      where: { id, deleted_at: IsNull() },
      relations: ['employee'],
    });
    if (!address) {
      throw new NotFoundException(`Адрес с id ${id} не найден`);
    }
    return address;
  }

  // Получение адреса по ID сотрудника
  async findByEmployeeId(employeeId: string): Promise<Address> {
    this.logger.log(`Finding address by employee_id: ${employeeId}`);
    const address = await this.repo.findOne({
      where: { employee_id: employeeId, deleted_at: IsNull() },
      relations: ['employee'],
    });
    if (!address) {
      throw new NotFoundException(`Адрес для сотрудника ${employeeId} не найден`);
    }
    return address;
  }

  // Обновление адреса
  async update(id: number, dto: UpdateAddressDto): Promise<Address> {
    this.logger.log(`Updating address: ${id}`);
    await this.findOne(id);
    await this.repo.update(id, { ...dto, updated_at: new Date() });
    return await this.findOne(id);
  }

  // Мягкое удаление адреса
  async remove(id: number): Promise<void> {
    this.logger.log(`Soft deleting address: ${id}`);
    await this.findOne(id);
    await this.repo.update(id, { deleted_at: new Date() });
  }

  // Восстановление адреса
  async restore(id: number): Promise<void> {
    this.logger.log(`Restoring address: ${id}`);
    await this.repo.update(id, { deleted_at: null });
  }
}