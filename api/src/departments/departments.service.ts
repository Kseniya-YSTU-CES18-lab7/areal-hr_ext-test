import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, Like } from 'typeorm';
import { Department } from './entities/department.entity';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { HistoryService } from '../history/history.service';

/**
 * Сервис для работы с отделами (CRUD + вложенная структура + мягкое удаление + история)
 */
@Injectable()
export class DepartmentsService {
  private readonly logger = new Logger(DepartmentsService.name);

  constructor(
    @InjectRepository(Department)
    private readonly repo: Repository<Department>,
    private readonly historyService: HistoryService,
  ) {}

  private async logChange(
    departmentId: number,
    fieldName: string,
    oldValue: any,
    newValue: any,
    operationType: 'create' | 'update' | 'delete',
    userId: string = 'system',
  ) {
    try {
      await this.historyService.create({
        userId,
        entityType: 'Department',
        entityId: departmentId.toString(),
        fieldName,
        oldValue: oldValue?.toString() ?? null,
        newValue: newValue?.toString() ?? null,
        operationType,
      });
    } catch (err: any) {
      this.logger.warn(`Failed to log history: ${err.message}`);
    }
  }

  async create(dto: CreateDepartmentDto): Promise<Department> {
    this.logger.log(`Creating department: ${dto.name}`);

    const existing = await this.repo.findOne({
      where: {
        name: dto.name,
        organizationId: dto.organizationId,
        deletedAt: IsNull(),
      },
    });

    if (existing) {
      throw new ConflictException(`Отдел "${dto.name}" уже существует в этой организации`);
    }

    if (dto.parentId) {
      const parent = await this.repo.findOne({
        where: { id: dto.parentId, deletedAt: IsNull() },
      });
      if (!parent) {
        throw new NotFoundException(`Родительский отдел с id ${dto.parentId} не найден`);
      }
    }

    const department = this.repo.create({
      name: dto.name,
      organizationId: dto.organizationId,
      parentId: dto.parentId ?? null,
      comment: dto.comment ?? null,
    });

    const saved = await this.repo.save(department);
    await this.logChange(saved.id, 'department', null, saved, 'create');
    return saved;
  }

  async findAll(
  organizationId?: number,
  search?: string,
  page: number = 1,
  limit: number = 20
): Promise<{ data: Department[]; total: number; page: number; limit: number }> {
  this.logger.log(`Finding all departments with pagination: page=${page}, limit=${limit}, search=${search}, orgId=${organizationId}`);
  
  const where: any = { deletedAt: IsNull() };
  
  if (organizationId) {
    where.organizationId = organizationId;
  }
  
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
  
  return { data, total, page, limit };
}

  async findTree(organizationId: number): Promise<Department[]> {
    const departments = await this.repo
      .createQueryBuilder('dept')
      .leftJoinAndSelect('dept.parent', 'parent')
      .where('dept.organizationId = :orgId', { orgId: organizationId })
      .andWhere('dept.deletedAt IS NULL')
      .orderBy('dept.name', 'ASC')
      .getMany();

    const map = new Map<number, Department>();
    const roots: Department[] = [];

    departments.forEach((dept) => {
      map.set(dept.id, { ...dept, children: [] } as Department);
    });

    departments.forEach((dept) => {
      const node = map.get(dept.id)!;
      if (dept.parentId && map.has(dept.parentId)) {
        const parent = map.get(dept.parentId)!;
        parent.children = parent.children || [];
        parent.children.push(node);
      } else {
        roots.push(node);
      }
    });

    return roots;
  }

  async findOne(id: number): Promise<Department> {
    const department = await this.repo.findOne({
      where: { id, deletedAt: IsNull() },
    });
    if (!department) {
      throw new NotFoundException(`Отдел с id ${id} не найден`);
    }
    return department;
  }

  async update(id: number, dto: UpdateDepartmentDto): Promise<Department> {
    const department = await this.findOne(id);

    if (dto.name && dto.name !== department.name) {
      await this.logChange(id, 'name', department.name, dto.name, 'update');
    }
    if (dto.comment !== undefined && dto.comment !== department.comment) {
      await this.logChange(id, 'comment', department.comment, dto.comment, 'update');
    }
    if (dto.parentId !== undefined && dto.parentId !== department.parentId) {
      await this.logChange(id, 'parentId', department.parentId, dto.parentId, 'update');
    }

    await this.repo.update(id, {
      ...dto,
      updatedAt: new Date(),
    });

    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.logChange(id, 'deletedAt', null, new Date(), 'delete');
    await this.repo.update(id, { deletedAt: new Date() });
  }

  async restore(id: number): Promise<void> {
    await this.repo.update(id, { deletedAt: null });
  }
}