/**
 * Контроллер для управления отделами (реализует стандартные CRUD-операции)
 */

import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  Logger
} from '@nestjs/common';
import { DepartmentsService } from './departments.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';

@Controller('departments')
export class DepartmentsController {
  private readonly logger = new Logger(DepartmentsController.name);
  
  constructor(private readonly service: DepartmentsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateDepartmentDto) {
    this.logger.log('POST /departments - create request');
    return await this.service.create(dto);
  }

  @Get()
  async findAll(@Query('organizationId') organizationId?: string) {
    this.logger.log('GET /departments - find all request');
    return await this.service.findAll(organizationId ? parseInt(organizationId, 10) : undefined);
  }

  /**
   * Возвращает иерархическую структуру отделов для указанной организации
   */
  @Get('tree')
  async findTree(@Query('organizationId', ParseIntPipe) organizationId: number) {
    this.logger.log(`GET /departments/tree - tree request for org ${organizationId}`);
    return await this.service.findTree(organizationId);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    this.logger.log(`GET /departments/${id} - find one request`);
    return await this.service.findOne(id);
  }

  @Patch(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateDepartmentDto) {
    this.logger.log(`PATCH /departments/${id} - update request`);
    return await this.service.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number) {
    this.logger.log(`DELETE /departments/${id} - remove request`);
    return await this.service.remove(id);
  }

  /**
   * Восстановить удалённый отдел
   */
  @Post(':id/restore')
  @HttpCode(HttpStatus.OK)
  async restore(@Param('id', ParseIntPipe) id: number) {
    this.logger.log(`POST /departments/${id}/restore - restore request`);
    return await this.service.restore(id);
  }
}