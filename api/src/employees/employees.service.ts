import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Employee } from './entities/employee.entity';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';

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
  ) {}

  // Создание нового сотрудника
  async create(dto: CreateEmployeeDto): Promise<Employee> {
    this.logger.log(`Creating employee: ${dto.surname} ${dto.first_name}`);
    const employee = this.repo.create(dto);
    return await this.repo.save(employee);
  }

  // Получение всех активных сотрудников
  async findAll(): Promise<Employee[]> {
    this.logger.log('Finding all employees');
    return await this.repo.find({
      where: { deleted_at: IsNull() },
      order: { surname: 'ASC', first_name: 'ASC' },
    });
  }

  // Получение сотрудника по ID (связанные сущности: паспорт, адрес, файлы, операции)
  async findOne(id: string): Promise<Employee> {
    this.logger.log(`Finding employee by id: ${id}`);
    const employee = await this.repo.findOne({
      where: { id, deleted_at: IsNull() },
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
    await this.findOne(id); // проверка на существование
    await this.repo.update(id, { ...dto, updated_at: new Date() });
    return await this.findOne(id);
  }

  // Мягкое удаление сотрудника
  async remove(id: string): Promise<void> {
    this.logger.log(`Soft deleting employee: ${id}`);
    await this.findOne(id); // проверка на существование
    await this.repo.update(id, { deleted_at: new Date() });
  }

  // Восстановление сотрудника
  async restore(id: string): Promise<void> {
    this.logger.log(`Restoring employee: ${id}`);
    await this.repo.update(id, { deleted_at: null });
  }
}