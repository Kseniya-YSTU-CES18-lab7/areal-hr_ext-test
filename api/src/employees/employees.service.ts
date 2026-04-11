import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, Not } from 'typeorm';
import { Employee } from './entities/employee.entity';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { HistoryService } from '../history/history.service';

// Интерфейс для фильтрации сотрудников
interface EmployeeFilters {
  surname?: string;
  firstName?: string;
  departmentId?: number;
}

/**
 * Сервис для работы с сотрудниками
 * CRUD-операции + мягкое удаление
 */
@Injectable()
export class EmployeesService {
  private readonly logger = new Logger(EmployeesService.name);

  constructor(
    @InjectRepository(Employee)
    private readonly repo: Repository<Employee>,
    // 🔹 ДОБАВЛЕНО: инжект HistoryService
    private readonly historyService: HistoryService,
  ) {}

  // Метод для записи в историю
  private async logChange(
    employeeId: string,
    fieldName: string,
    oldValue: any,
    newValue: any,
    operationType: 'create' | 'update' | 'delete',
    userId: string = 'system'
  ) {
    try {
      await this.historyService.create({
        userId,
        entityType: 'Employee',
        entityId: employeeId,
        fieldName,
        oldValue: oldValue?.toString() ?? null,
        newValue: newValue?.toString() ?? null,
        operationType,
      });
    } catch (err: any) {
      this.logger.warn(`Failed to log history: ${err.message}`);
    }
  }

  // Создание нового сотрудника
  async create(dto: CreateEmployeeDto): Promise<Employee> {
    this.logger.log(`Creating employee: ${dto.surname} ${dto.firstName}`);
    const employee = this.repo.create(dto);
    const saved = await this.repo.save(employee);
    // Авто-логирование создания
    await this.logChange(saved.id, 'employee', null, saved, 'create');
    return saved;
  }

  // Получение всех активных сотрудников
  async findAll(filters?: EmployeeFilters): Promise<Employee[]> {
    this.logger.log('Finding all employees');
    return await this.repo.find({
      where: { deletedAt: IsNull() },
      order: { surname: 'ASC', firstName: 'ASC' },
    });
  }

  // Получение уволенных сотрудников (мягко удалённых)
  async findFired(): Promise<Employee[]> {
    this.logger.log('Finding fired employees');
    return await this.repo.find({
      where: { deletedAt: Not(IsNull()) },  // только удалённые
      order: { deletedAt: 'DESC' },          // сначала недавно уволенные
  });
}

  // Получение сотрудника по ID (связанные сущности: паспорт, адрес, файлы, операции)
  async findOne(id: string): Promise<Employee> {
    this.logger.log(`Finding employee by id: ${id}`);
    const employee = await this.repo.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['passport', 'address', 'files', 'operations'],
    });
    if (!employee) {
      throw new NotFoundException(`Сотрудник с id ${id} не найден`);
    }
    return employee;
  }

  // Обновление сотрудника
  async update(id: string, dto: UpdateEmployeeDto): Promise<Employee> {
    this.logger.log(`Updating employee: ${id}`);
    
    // Проверяем, что сотрудник существует И активен (не удалён)
    const employee = await this.repo.findOne({
      where: { id, deletedAt: IsNull() }
    });
    
    if (!employee) {
      throw new NotFoundException(`Сотрудник с id ${id} не найден или уволен`);
    }
    
    // Логирование каждого изменённого поля
    if (dto.surname && dto.surname !== employee.surname) {
      await this.logChange(id, 'surname', employee.surname, dto.surname, 'update');
    }
    if (dto.firstName && dto.firstName !== employee.firstName) {
      await this.logChange(id, 'firstName', employee.firstName, dto.firstName, 'update');
    }
    if (dto.patronymic !== undefined && dto.patronymic !== employee.patronymic) {
      await this.logChange(id, 'patronymic', employee.patronymic, dto.patronymic, 'update');
    }
    if (dto.birthDate && dto.birthDate !== employee.birthDate) {
      await this.logChange(id, 'birthDate', employee.birthDate, dto.birthDate, 'update');
    }
    
    // Обновляем
    await this.repo.update(id, { ...dto });
    return await this.findOne(id);
  }

  // Мягкое удаление сотрудника
  async remove(id: string): Promise<void> {
    this.logger.log(`Soft deleting employee: ${id}`);
    // Проверка на существование и активность
    const employee = await this.repo.findOne({
      where: { id, deletedAt: IsNull() }
    });
    
    if (!employee) {
      throw new NotFoundException(`Сотрудник с id ${id} не найден или уволен`);
    }
    
    // Авто-логирование удаления
    await this.logChange(id, 'deletedAt', null, new Date(), 'delete');
    await this.repo.update(id, { deletedAt: new Date() });
  }

  // Восстановление сотрудника
  async restore(id: string): Promise<void> {
    this.logger.log(`Restoring employee: ${id}`);
    await this.repo.update(id, { deletedAt: null });
  }
}