import { Injectable, NotFoundException, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, Like } from 'typeorm';
import { File } from './entities/file.entity';
import { CreateFileDto } from './dto/create-file.dto';
import { UpdateFileDto } from './dto/update-file.dto';
import { HistoryService } from '../history/history.service';

/**
 * Сервис для работы с файлами
 * Связь с сотрудником: N:1 (у одного сотрудника может быть много файлов)
 */
@Injectable()
export class FilesService {
  private readonly logger = new Logger(FilesService.name);

  constructor(
    @InjectRepository(File)
    private readonly repo: Repository<File>,
    private readonly historyService: HistoryService,
  ) {}

  // Метод для записи в историю
  private async logChange(
  fileId: number,
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
      entityType: 'File',
      entityId: fileId.toString(),
      fieldName,
      oldValue: oldValue?.toString() ?? null,
      newValue: newValue?.toString() ?? null,
      operationType,
    });
    this.logger.log(`✅ History logged: ${fieldName} for file ${fileId}`);
  } catch (err: any) {
    this.logger.error(`✗ Failed to log history for file ${fileId}, field ${fieldName}: ${err.message}`, err.stack);
    if (process.env.NODE_ENV === 'development') {
      throw err;
    }
  }
}

  // Создание записи о файле после загрузки через Multer
  async createWithFile(dto: CreateFileDto, file: Express.Multer.File): Promise<File> {
    this.logger.log(`Creating file record for employee: ${dto.employeeId}, file: ${file.originalname}`);

    const relativePath = file.path.replace(process.cwd() + '/', '');

    const fileEntity = this.repo.create({
      employeeId: dto.employeeId,
      title: dto.title,
      filePath: relativePath,
      mimeType: file.mimetype,
      sizeBytes: file.size,
    });

    const saved = await this.repo.save(fileEntity);
    await this.logChange(saved.id, dto.employeeId, 'file', null, JSON.stringify(saved), 'create');

    return saved;
  }

  // Создание записи о файле (старый метод)
  async create(dto: CreateFileDto): Promise<File> {
    this.logger.warn('FilesService.create() called without file — deprecated');
    throw new BadRequestException('Используйте multipart/form-data для загрузки файлов');
  }

  // Получение всех активных файлов с поиском и пагинацией
  async findAll(
    search?: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{ data: File[]; total: number; page: number; limit: number }> {
    const where: any = { deletedAt: IsNull() };
    
    if (search) {
      where.title = Like(`%${search}%`);
    }

    const total = await this.repo.count({ where });

    const data = await this.repo.find({
      where,
      relations: ['employee'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, total, page, limit };
  }

  // Получение всех файлов сотрудника
  async findByEmployeeId(employeeId: string): Promise<File[]> {
    this.logger.log(`Finding files for employee: ${employeeId}`);
    return await this.repo.find({
      where: { employeeId: employeeId, deletedAt: IsNull() },
      relations: ['employee'],
      order: { createdAt: 'DESC' },
    });
  }

  // Получение файла по ID
  async findOne(id: number): Promise<File> {
    this.logger.log(`Finding file by id: ${id}`);
    const file = await this.repo.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['employee'],
    });
    if (!file) {
      throw new NotFoundException(`Файл с id ${id} не найден`);
    }
    return file;
  }

  // Обновление информации о файле
  async update(id: number, dto: UpdateFileDto): Promise<File> {
    this.logger.log(`Updating file: ${id}`);
    const file = await this.findOne(id);

    if (dto.title && dto.title !== file.title) {
      await this.logChange(id, file.employeeId, 'title', JSON.stringify(file.title), JSON.stringify(dto.title), 'update');
    }

    await this.repo.update(id, { ...dto });
    return await this.findOne(id);
  }

  // Мягкое удаление файла
  async remove(id: number): Promise<void> {
    this.logger.log(`Soft deleting file: ${id}`);
    const file = await this.findOne(id);
    await this.logChange(id, file.employeeId, 'deletedAt', null, JSON.stringify(new Date()), 'delete');
    await this.repo.update(id, { deletedAt: new Date() });
  }

  // Восстановление файла
  async restore(id: number): Promise<void> {
    this.logger.log(`Restoring file: ${id}`);
    await this.repo.update(id, { deletedAt: null });
  }
}