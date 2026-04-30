import { Injectable, NotFoundException, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, Not, Like, DataSource, Brackets } from 'typeorm'; 
import { Employee } from './entities/employee.entity';
import { Passport } from '../passports/entities/passport.entity';
import { Address } from '../addresses/entities/address.entity';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { CreateEmployeeFullDto } from './dto/create-employee-full.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { HistoryService } from '../history/history.service';
import { DeepPartial } from 'typeorm';

interface EmployeeFilters {
  surname?: string;
  firstName?: string;
  departmentId?: number;
}

/**
 * Сервис для работы с сотрудниками
 * CRUD-операции + мягкое удаление + транзакции
 */
@Injectable()
export class EmployeesService {
  private readonly logger = new Logger(EmployeesService.name);

  constructor(
    @InjectRepository(Employee)
    private readonly repo: Repository<Employee>,
    @InjectRepository(Passport)
    private readonly passportRepo: Repository<Passport>,
    @InjectRepository(Address)
    private readonly addressRepo: Repository<Address>,
    private readonly historyService: HistoryService,
    private readonly dataSource: DataSource,  // DataSource для транзакций
  ) {}

    // Метод для записи в историю
    private async logChange(
    employeeId: string,
    fieldName: string,
    oldValue: any,
    newValue: any,
    operationType: 'create' | 'update' | 'delete',
    userId: string,
  ) {
    // ОТЛАДКА
    //console.log('🔍 DEBUG logChange - userId received:', userId);
    
    try {
      await this.historyService.create({
        userId,  // должен быть реальный ID
        entityType: 'Employee',
        entityId: employeeId,
        fieldName,
        oldValue: oldValue?.toString() ?? null,
        newValue: newValue?.toString() ?? null,
        operationType,
      });
      this.logger.log(`✅ History logged: ${fieldName} for employee ${employeeId}`);
    } catch (err: any) {
      this.logger.error(`✗ Failed to log history for employee ${employeeId}, field ${fieldName}: ${err.message}`, err.stack);
      if (process.env.NODE_ENV === 'development') {
        throw err;
      }
    }
  }

  /**
   * Создание сотрудника с паспортными данными и адресом в ОДНОЙ транзакции
   * Если что-то упадёт — всё откатится назад
   */
  async createFull(dto: CreateEmployeeFullDto, userId?: string): Promise<Employee> {
  this.logger.log(`Creating employee with full data: ${dto.surname} ${dto.firstName}`);

  return await this.dataSource.transaction(async (manager) => {
    // 1. Создаём сотрудника с правильными типами
    const employeeData: DeepPartial<Employee> = {
    surname: dto.surname,
    firstName: dto.firstName,
    patronymic: dto.patronymic ?? null,
    birthDate: dto.birthDate ?? null,
    departmentId: dto.departmentId ?? null,
  } as any;
    const employee = manager.create(Employee, employeeData);
    const savedEmployee = await manager.save(employee);
    this.logger.log(`Employee created with ID: ${savedEmployee.id}`);

    // 2. Если есть паспорт — создаём
    if (dto.passport) {
      const passport = manager.create(Passport, {
        employeeId: savedEmployee.id,
        series: dto.passport.series,
        number: dto.passport.number,
        issueDate: dto.passport.issueDate,
        departmentCode: dto.passport.departmentCode,
        issuedBy: dto.passport.issuedBy,
      });
      await manager.save(passport);
      this.logger.log(`Passport created for employee: ${savedEmployee.id}`);
    }

    // 3. Если есть адрес — создаём
    if (dto.address) {
      const address = manager.create(Address, {
        employeeId: savedEmployee.id,
        region: dto.address.region,
        locality: dto.address.locality,
        street: dto.address.street,
        house: dto.address.house,
        building: dto.address.building,
        apartment: dto.address.apartment,
      });
      await manager.save(address);
      this.logger.log(`Address created for employee: ${savedEmployee.id}`);
    }

    // 4. Логирование
    const fullName = `${savedEmployee.surname} ${savedEmployee.firstName} ${savedEmployee.patronymic || ''}`.trim();
    await this.logChange(savedEmployee.id, 'employee', null, fullName, 'create', userId ?? '00000000-0000-4000-8000-000000000000');

    // 5. Возвращаем сотрудника с связями
    const result = await manager.findOne(Employee, {
      where: { id: savedEmployee.id },
      relations: ['passport', 'address'],
    });
    if (!result) {
      throw new Error('Failed to load created employee');
    }
    return result;
  });
}

  /**
   * Создание сотрудника (метод, без паспорта и адреса)
   * для обратной совместимости
   */
    async create(dto: CreateEmployeeDto, userId?: string): Promise<Employee> {
    this.logger.log(`Creating employee: ${dto.surname} ${dto.firstName}`);
    const employee = this.repo.create(dto);
    const saved = await this.repo.save(employee);
    const fullName = `${saved.surname} ${saved.firstName} ${saved.patronymic || ''}`.trim();
    await this.logChange(saved.id, 'employee', null, fullName, 'create', userId ?? '00000000-0000-4000-8000-000000000000');
    return saved;
  }

  // Получение всех активных сотрудников
async findAll(
  filters?: EmployeeFilters,
  page: number = 1,
  limit: number = 20
): Promise<{ data: Employee[]; total: number; page: number; limit: number }> {  
  
  const query = this.repo.createQueryBuilder('employee')
    .where('employee.deletedAt IS NULL');
  
  // Поиск по ФИО (фамилия ИЛИ имя ИЛИ отчество)
  if (filters?.surname || filters?.firstName) {
    const searchTerms: string[] = [];
    if (filters?.surname) searchTerms.push(filters.surname);
    if (filters?.firstName) searchTerms.push(filters.firstName);
    
    if (searchTerms.length > 0) {
      query.andWhere(
        new Brackets(qb => {
          searchTerms.forEach((term, index) => {
            const paramName = `search${index}`;
            const searchTerm = `%${term}%`;
            qb.orWhere(`employee.surname ILIKE :${paramName}`, { [paramName]: searchTerm })
              .orWhere(`employee.firstName ILIKE :${paramName}`, { [paramName]: searchTerm })
              .orWhere(`employee.patronymic ILIKE :${paramName}`, { [paramName]: searchTerm });
          });
        })
      );
    }
  }
  
  // Фильтрация по отделу
  if (filters?.departmentId) {
    query.andWhere('employee.departmentId = :departmentId', { departmentId: filters.departmentId });
  }

  const [data, total] = await query
    .leftJoinAndSelect('employee.passport', 'passport')
    .leftJoinAndSelect('employee.address', 'address')
    .leftJoinAndSelect('employee.department', 'department')
    .orderBy('employee.surname', 'ASC')
    .addOrderBy('employee.firstName', 'ASC')
    .skip((page - 1) * limit)
    .take(limit)
    .getManyAndCount();

  return { data, total, page, limit };
}

  // Получение уволенных сотрудников
  async findFired(): Promise<Employee[]> {
    this.logger.log('Finding fired employees');
    return await this.repo.find({
      where: { deletedAt: Not(IsNull()) },
      order: { deletedAt: 'DESC' },
      relations: ['passport', 'address'],
    });
  }

  // Получение сотрудника по ID
  async findOne(id: string): Promise<Employee> {
    this.logger.log(`Finding employee by id: ${id}`);
    const employee = await this.repo.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['passport', 'address', 'files', 'operations', 'department'],
    });
    if (!employee) {
      throw new NotFoundException(`Сотрудник с id ${id} не найден`);
    }
    return employee;
  }

  // Обновление сотрудника
async update(id: string, dto: UpdateEmployeeDto, userId?: string): Promise<Employee> {
  this.logger.log(`Updating employee: ${id}`);
  const employee = await this.repo.findOne({
    where: { id, deletedAt: IsNull() },
  });
  if (!employee) {
    throw new NotFoundException(`Сотрудник с id ${id} не найден или уволен`);
  }

  // Логирование изменений (передаём userId)
  if (dto.surname && dto.surname !== employee.surname) {
    await this.logChange(id, 'surname', JSON.stringify(employee.surname), JSON.stringify(dto.surname), 'update', userId ?? '00000000-0000-4000-8000-000000000000');
  }
  if (dto.firstName && dto.firstName !== employee.firstName) {
    await this.logChange(id, 'firstName', JSON.stringify(employee.firstName), JSON.stringify(dto.firstName), 'update', userId ?? '00000000-0000-4000-8000-000000000000');
  }
  if (dto.patronymic !== undefined && dto.patronymic !== employee.patronymic) {
    await this.logChange(id, 'patronymic', JSON.stringify(employee.patronymic), JSON.stringify(dto.patronymic), 'update', userId ?? '00000000-0000-4000-8000-000000000000');
  }
  if (dto.birthDate && dto.birthDate !== employee.birthDate) {
    await this.logChange(id, 'birthDate', employee.birthDate, dto.birthDate, 'update', userId ?? '00000000-0000-4000-8000-000000000000');
  }

  // Логирование изменения отдела
  if (dto.departmentId !== undefined) {
    const oldDeptId = employee.departmentId;
    const newDeptId = dto.departmentId;
    
    if (oldDeptId !== newDeptId) {
      await this.logChange(
        id, 
        'departmentId', 
        oldDeptId?.toString() ?? null, 
        newDeptId?.toString() ?? null, 
        'update',
        userId ?? '00000000-0000-4000-8000-000000000000'
      );
      this.logger.log(`📝 History logged: departmentId changed from ${oldDeptId} to ${newDeptId} for employee ${id}`);
    }
  }

  this.logger.log(`🔍 DEBUG update payload for employee ${id}:`, {
    surname: dto.surname,
    firstName: dto.firstName,
    departmentId: (dto as any).departmentId,
    hasDepartmentId: (dto as any).departmentId !== undefined
  });

  await this.repo.update(id, { ...dto });
  return await this.findOne(id);
}

  // Мягкое удаление сотрудника
  async remove(id: string, userId?: string): Promise<void> {
    this.logger.log(`Soft deleting employee: ${id}`);
    const employee = await this.repo.findOne({
      where: { id, deletedAt: IsNull() },
    });
    if (!employee) {
      throw new NotFoundException(`Сотрудник с id ${id} не найден или уволен`);
    }
    // 🔥 Передаём userId
    await this.logChange(id, 'deletedAt', null, new Date(), 'delete', userId ?? '00000000-0000-4000-8000-000000000000');
    await this.repo.update(id, { deletedAt: new Date() });
  }

  // Восстановление сотрудника
  async restore(id: string): Promise<void> {
    this.logger.log(`Restoring employee: ${id}`);
    await this.repo.update(id, { deletedAt: null });
  }
}