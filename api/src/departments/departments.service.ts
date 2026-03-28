import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Department } from './entities/department.entity';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';

/**
 * Сервис для работы с отделами (CRUD-операции с поддержкой вложенной структуры и soft delete)
 */
@Injectable()
export class DepartmentsService {
  constructor(
    @InjectRepository(Department)
    private readonly repo: Repository<Department>,
  ) {}

  /**
   * Создать новый отдел
   */
  async create(dto: CreateDepartmentDto): Promise<Department> {
    // Проверка на дубликат названия (в рамках одной организации)
    const existing = await this.repo.findOne({
      where: {
        name: dto.name,
        organization_id: dto.organization_id,
        deleted_at: IsNull(),
      },
    });

    if (existing) {
      throw new ConflictException(
        `Отдел "${dto.name}" уже существует в этой организации`,
      );
    }

    // Если указан parent_id, проверяем, что родитель существует
    if (dto.parent_id) {
      const parent = await this.repo.findOne({
        where: { id: dto.parent_id, deleted_at: IsNull() },
      });
      if (!parent) {
        throw new NotFoundException(
          `Родительский отдел с id ${dto.parent_id} не найден`,
        );
      }
    }

  const department = this.repo.create({
    name: dto.name,
    organization_id: dto.organization_id,
    parent_id: dto.parent_id ?? null,
    comment: dto.comment ?? null,
  });

  return await this.repo.save(department);
  }

  /**
   * Получить все активные отделы организации
   */
  async findAll(organizationId?: number): Promise<Department[]> {
    const where: any = { deleted_at: IsNull() };
    if (organizationId) {
      where.organization_id = organizationId;
    }

    return await this.repo.find({
      where,
      order: { name: 'ASC' },
    });
  }

  /**
   * Получить дерево отделов для организации (возвращает вложенную структуру)
   */
  async findTree(organizationId: number): Promise<Department[]> {
    const departments = await this.repo
      .createQueryBuilder('dept')
      .leftJoinAndSelect('dept.parent', 'parent')
      .where('dept.organization_id = :orgId', { orgId: organizationId })
      .andWhere('dept.deleted_at IS NULL')
      .orderBy('dept.name', 'ASC')
      .getMany();

    // Строим дерево (группируем по parent_id)
    const map = new Map<number, Department>();
    const roots: Department[] = [];

    departments.forEach((dept) => {
      map.set(dept.id, { ...dept, children: [] } as Department);
    });

    departments.forEach((dept) => {
      const node = map.get(dept.id)!;
      if (dept.parent_id && map.has(dept.parent_id)) {
        const parent = map.get(dept.parent_id)!;
        parent.children = parent.children || [];
        parent.children.push(node);
      } else {
        roots.push(node);
      }
    });

    return roots;
  }

  /**
   * Получить отдел по ID
   */
  async findOne(id: number): Promise<Department> {
    const department = await this.repo.findOne({
      where: { id, deleted_at: IsNull() },
    });

    if (!department) {
      throw new NotFoundException(`Отдел с id ${id} не найден`);
    }

    return department;
  }

  /**
   * Обновить отдел
   */
  async update(id: number, dto: UpdateDepartmentDto): Promise<Department> {
    const department = await this.findOne(id);

    // Если меняем название, то проверяем на дубликат
    if (dto.name && dto.name !== department.name) {
      const existing = await this.repo.findOne({
        where: {
          name: dto.name,
          organization_id: dto.organization_id ?? department.organization_id,
          deleted_at: IsNull(),
        },
      });
      if (existing) {
        throw new ConflictException(
          `Отдел "${dto.name}" уже существует в этой организации`,
        );
      }
    }

    // Если меняем parent_id — проверяем, что новый родитель существует
    if (dto.parent_id !== undefined && dto.parent_id !== null) {
      const parent = await this.repo.findOne({
        where: { id: dto.parent_id, deleted_at: IsNull() },
      });
      if (!parent) {
        throw new NotFoundException(
          `Родительский отдел с id ${dto.parent_id} не найден`,
        );
      }
    }

    await this.repo.update(id, {
      ...dto,
      updated_at: new Date(),
    });

    return this.findOne(id);
  }

  /**
   * Пометить отдел как удалённый (мягкое удаление)
   */
  async remove(id: number): Promise<void> {
    await this.findOne(id); // проверим, что существует
    await this.repo.update(id, { deleted_at: new Date() });
  }

  /**
   * Восстановить удалённый отдел (понадобиться для администратора)
   */
  async restore(id: number): Promise<void> {
    await this.repo.update(id, { deleted_at: null });
  }
}