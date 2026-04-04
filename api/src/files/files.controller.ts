import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  ParseIntPipe, 
  Query,
  HttpCode, 
  HttpStatus, 
  Logger 
} from '@nestjs/common';
import { FilesService } from './files.service';
import { CreateFileDto } from './dto/create-file.dto';
import { UpdateFileDto } from './dto/update-file.dto';

/**
 * Контроллер для управления файлами
 * Связь с сотрудником: N:1 (у одного сотрудника может быть много файлов)
 */
@Controller('files')
export class FilesController {
  private readonly logger = new Logger(FilesController.name);

  constructor(private readonly service: FilesService) {}

  // Создание записи о файле
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateFileDto) {
    this.logger.log('POST /files - create request');
    return await this.service.create(dto);
  }

  // Получение всех файлов
  @Get()
  async findAll() {
    this.logger.log('GET /files - find all request');
    return await this.service.findAll();
  }

  // Получение всех файлов сотрудника
  @Get('by-employee/:employeeId')
  async findByEmployeeId(@Param('employeeId') employeeId: string) {
    this.logger.log(`GET /files/by-employee/${employeeId} - find by employee request`);
    return await this.service.findByEmployeeId(employeeId);
  }

  // Получение файла по ID
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    this.logger.log(`GET /files/${id} - find one request`);
    return await this.service.findOne(id);
  }

  // Обновление информации о файле
  @Patch(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateFileDto) {
    this.logger.log(`PATCH /files/${id} - update request`);
    return await this.service.update(id, dto);
  }

  // Мягкое удаление файла
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number) {
    this.logger.log(`DELETE /files/${id} - remove request`);
    return await this.service.remove(id);
  }

  // Восстановление файла
  @Post(':id/restore')
  @HttpCode(HttpStatus.OK)
  async restore(@Param('id', ParseIntPipe) id: number) {
    this.logger.log(`POST /files/${id}/restore - restore request`);
    return await this.service.restore(id);
  }
}