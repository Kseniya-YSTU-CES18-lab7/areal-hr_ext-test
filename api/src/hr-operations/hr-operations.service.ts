import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { HrOperation } from './entities/hr-operation.entity';
import { CreateHrOperationDto } from './dto/create-hr-operation.dto';
import { UpdateHrOperationDto } from './dto/update-hr-operation.dto';
import { HistoryService } from '../history/history.service';

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
    // 🔹 ДОБАВЛЕНО: инжект HistoryService
    private readonly historyService: HistoryService,
  ) {}

  // Метод для записи в историю
  private async logChange(
  operationId: number,
  employeeId: string,
  fieldName: string,
  oldValue: any,
  newValue: any,
  operationType: 'create' | 'update' | 'delete',
  userId: string = '00000000-0000-4000-8000-000000000000',
) {
  try {
    await this.historyService.create({
      userId,
      entityType: 'HROperation',
      entityId: operationId.toString(),
      fieldName,
      oldValue: oldValue?.toString() ?? null,
      newValue: newValue?.toString() ?? null,
      operationType,
    });
    this.logger.log(`✅ History logged: ${fieldName} for HR operation ${operationId}`);
  } catch (err: any) {
    this.logger.error(`✗ Failed to log history for HR operation ${operationId}, field ${fieldName}: ${err.message}`, err.stack);
    if (process.env.NODE_ENV === 'development') {
      throw err;
    }
  }
}

  // Создание кадровой операции
  async create(dto: CreateHrOperationDto): Promise<HrOperation> {
    this.logger.log(`Creating HR operation: ${dto.operationType} for employee: ${dto.employeeId}`);
    const operation = this.repo.create(dto);
    const saved = await this.repo.save(operation);
    
    // Авто-логирование создания
    await this.logChange(saved.id, saved.employeeId, 'hr_operation', null, JSON.stringify(saved), 'create');
    return saved;
  }

  // Получение всех активных операций (сортировка по дате, новые сверху)
  async findAll(): Promise<HrOperation[]> {
    this.logger.log('Finding all HR operations');
    return await this.repo.find({
      where: { deletedAt: IsNull() },
      relations: ['employee', 'department', 'position'],
      order: { operationDate: 'DESC' },
    });
  }

  // Получение всех операций сотрудника
  async findByEmployeeId(employeeId: string): Promise<HrOperation[]> {
    this.logger.log(`Finding HR operations for employee: ${employeeId}`);
    return await this.repo.find({
      where: { employeeId: employeeId, deletedAt: IsNull() },
      relations: ['employee', 'department', 'position'],
      order: { operationDate: 'DESC' },
    });
  }

  // Получение операции по ID
  async findOne(id: number): Promise<HrOperation> {
    this.logger.log(`Finding HR operation by id: ${id}`);
    const operation = await this.repo.findOne({
      where: { id, deletedAt: IsNull() },
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
    
    // Получаем текущую операцию для логирования
    const operation = await this.findOne(id);
    
    // Логирование каждого изменённого поля
    if (dto.departmentId !== undefined && dto.departmentId !== operation.departmentId) {
      await this.logChange(id, operation.employeeId, 'departmentId', JSON.stringify(operation.departmentId), JSON.stringify(dto.departmentId), 'update');
    }
    if (dto.positionId !== undefined && dto.positionId !== operation.positionId) {
      await this.logChange(id, operation.employeeId, 'positionId', JSON.stringify(operation.positionId), JSON.stringify(dto.positionId), 'update');
    }
    if (dto.salary !== undefined && dto.salary !== operation.salary) {
      await this.logChange(id, operation.employeeId, 'salary', JSON.stringify(operation.salary), JSON.stringify(dto.salary), 'update');
    }
    if (dto.operationDate && dto.operationDate !== operation.operationDate) {
      await this.logChange(id, operation.employeeId, 'operationDate', JSON.stringify(operation.operationDate), JSON.stringify(dto.operationDate), 'update');
    }
    
    await this.repo.update(id, dto);
    return await this.findOne(id);
  }

  // Мягкое удаление операции
  async remove(id: number): Promise<void> {
    this.logger.log(`Soft deleting HR operation: ${id}`);
    const operation = await this.findOne(id);
    // Авто-логирование удаления
    await this.logChange(id, operation.employeeId, 'deletedAt', null, JSON.stringify(new Date()), 'delete');
    await this.repo.update(id, { deletedAt: new Date() });
  }

  // Восстановление операции
  async restore(id: number): Promise<void> {
    this.logger.log(`Restoring HR operation: ${id}`);
    await this.repo.update(id, { deletedAt: null });
  }
}