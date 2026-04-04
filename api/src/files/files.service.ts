import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { File } from './entities/file.entity';
import { CreateFileDto } from './dto/create-file.dto';
import { UpdateFileDto } from './dto/update-file.dto';

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
  ) {}

  // Создание записи о файле
  async create(dto: CreateFileDto): Promise<File> {
    this.logger.log(`Creating file for employee: ${dto.employee_id}`);
    const file = this.repo.create(dto);
    return await this.repo.save(file);
  }

  // Получение всех активных файлов
  async findAll(): Promise<File[]> {
    this.logger.log('Finding all files');
    return await this.repo.find({
      where: { deleted_at: IsNull() },
      relations: ['employee'],
    });
  }

  // Получение всех файлов сотрудника
  async findByEmployeeId(employeeId: string): Promise<File[]> {
    this.logger.log(`Finding files for employee: ${employeeId}`);
    return await this.repo.find({
      where: { employee_id: employeeId, deleted_at: IsNull() },
      relations: ['employee'],
    });
  }

  // Получение файла по ID
  async findOne(id: number): Promise<File> {
    this.logger.log(`Finding file by id: ${id}`);
    const file = await this.repo.findOne({
      where: { id, deleted_at: IsNull() },
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
    await this.findOne(id);
    await this.repo.update(id, { ...dto });
    return await this.findOne(id);
  }

  // Мягкое удаление файла
  async remove(id: number): Promise<void> {
    this.logger.log(`Soft deleting file: ${id}`);
    await this.findOne(id);
    await this.repo.update(id, { deleted_at: new Date() });
  }

  // Восстановление файла
  async restore(id: number): Promise<void> {
    this.logger.log(`Restoring file: ${id}`);
    await this.repo.update(id, { deleted_at: null });
  }
}