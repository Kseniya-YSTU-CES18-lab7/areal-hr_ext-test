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
  Logger,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  UseGuards,  
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfig } from '../config/multer.config';
import { FilesService } from './files.service';
import { CreateFileDto } from './dto/create-file.dto';
import { UpdateFileDto } from './dto/update-file.dto';
import { FileResponseDto } from './dto/file.response.dto';
import { RolesGuard } from '../common/guards/roles.guard';  
import { Roles } from '../common/decorators/roles.decorator';
import { SessionGuard } from '../common/guards/session.guard';  

/**
 * Контроллер для управления файлами
 * Связь с сотрудником: N:1 (у одного сотрудника может быть много файлов)
 */
@Controller('files')
export class FilesController {
  private readonly logger = new Logger(FilesController.name);

  constructor(private readonly service: FilesService) {}

  // Загрузка файла + создание записи в БД (multipart/form-data)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(SessionGuard, RolesGuard)  
  @Roles('admin', 'manager')
  @UseInterceptors(FileInterceptor('file', multerConfig))
  async create(
    @Body() dto: CreateFileDto,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<FileResponseDto> {
    this.logger.log('POST /files - upload file request');

    if (!file) {
      throw new BadRequestException('Файл не был загружен. Используйте multipart/form-data с полем "file"');
    }

    const result = await this.service.createWithFile(dto, file);
    return result as any;
  }

  // Получение всех файлов (с поиском и пагинацией)
  @Get()
  @UseGuards(SessionGuard)  
  async findAll(
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string
  ): Promise<{ data: FileResponseDto[]; total: number; page: number; limit: number }> {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;
    this.logger.log(`GET /files - find all request: page=${pageNum}, limit=${limitNum}, search=${search}`);
    const result = await this.service.findAll(search, pageNum, limitNum);
    return result as any;
  }

  // Получение всех файлов сотрудника
  @Get('by-employee/:employeeId')
  @UseGuards(SessionGuard)  
  async findByEmployeeId(@Param('employeeId') employeeId: string): Promise<FileResponseDto[]> {
    this.logger.log(`GET /files/by-employee/${employeeId} - find by employee request`);
    return (await this.service.findByEmployeeId(employeeId)) as any;
  }

  // Получение файла по ID
  @Get(':id')
  @UseGuards(SessionGuard)  
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<FileResponseDto> {
    this.logger.log(`GET /files/${id} - find one request`);
    return (await this.service.findOne(id)) as any;
  }

  // Обновление информации о файле
  @Patch(':id')
  @UseGuards(SessionGuard, RolesGuard)  
  @Roles('admin', 'manager')  
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateFileDto): Promise<FileResponseDto> {
    this.logger.log(`PATCH /files/${id} - update request`);
    return (await this.service.update(id, dto)) as any;
  }

  // Мягкое удаление файла
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(SessionGuard, RolesGuard)  
  @Roles('admin')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    this.logger.log(`DELETE /files/${id} - remove request`);
    return await this.service.remove(id);
  }

  // Восстановление файла
  @Post(':id/restore')
  @HttpCode(HttpStatus.OK)
  @UseGuards(SessionGuard, RolesGuard)  
  @Roles('admin')
  async restore(@Param('id', ParseIntPipe) id: number): Promise<void> {
    this.logger.log(`POST /files/${id}/restore - restore request`);
    return await this.service.restore(id);
  }
}