import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { HrOperation } from './entities/hr-operation.entity';
import { CreateHrOperationDto } from './dto/create-hr-operation.dto';
import { UpdateHrOperationDto } from './dto/update-hr-operation.dto';

/**
 * Сервис для работы с кадровыми операциями
 * Типы операций: hire, change_salary, change_department, dismissal
 */
@Injectable()
export class HrOperationsService {
  private readonly logger = new Logger(HrOperationsService.name);

  constructor(
    @InjectRepository(HrOperation)
    private readonly repo: Repository<HrOperation>,
  ) {}

  // Создание кадровой операции
  async create(dto: CreateHrOperationDto): Promise<HrOperation> {
    this.logger.log(`Creating HR operation: ${dto.operation_type} for employee: ${dto.employee_id}`);
    const operation = this.repo.create(dto);
    return await this.repo.save(operation);
  }

  // Получение всех активных операций (сортировка по дате, новые сверху)
  async findAll(): Promise<HrOperation[]> {
    this.logger.log('Finding all HR operations');
    return await this.repo.find({
      where: { deleted_at: IsNull() },
      relations: ['employee', 'department', 'position'],
      order: { operation_date: 'DESC' },
    });
  }

  // Получение всех операций сотрудника
  async findByEmployeeId(employeeId: string): Promise<HrOperation[]> {
    this.logger.log(`Finding HR operations for employee: ${employeeId}`);
    return await this.repo.find({
      where: { employee_id: employeeId, deleted_at: IsNull() },
      relations: ['employee', 'department', 'position'],
      order: { operation_date: 'DESC' },
    });
  }

  // Получение операции по ID
  async findOne(id: number): Promise<HrOperation> {
    this.logger.log(`Finding HR operation by id: ${id}`);
    const operation = await this.repo.findOne({
      where: { id, deleted_at: IsNull() },
      relations: ['employee', 'department', 'position'],
    });
    if (!operation) {
      throw new NotFoundException(`Кадровая операция с id ${id} не найдена`);
    }
    return operation;
  }

  // Обновление операции (updated_at обновляется автоматически)
  async update(id: number, dto: UpdateHrOperationDto): Promise<HrOperation> {
    this.logger.log(`Updating HR operation: ${id}`);
    await this.findOne(id);
    await this.repo.update(id, dto);
    return await this.findOne(id);
  }

  // Мягкое удаление операции
  async remove(id: number): Promise<void> {
    this.logger.log(`Soft deleting HR operation: ${id}`);
    await this.findOne(id);
    await this.repo.update(id, { deleted_at: new Date() });
  }

  // Восстановление операции
  async restore(id: number): Promise<void> {
    this.logger.log(`Restoring HR operation: ${id}`);
    await this.repo.update(id, { deleted_at: null });
  }
}