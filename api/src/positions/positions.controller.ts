// Контроллер для управления должностями через REST API

import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  Logger
} from '@nestjs/common';
import { PositionsService } from './positions.service';
import { CreatePositionDto } from './dto/create-position.dto';
import { UpdatePositionDto } from './dto/update-position.dto';

@Controller('positions')
export class PositionsController {
  private readonly logger = new Logger(PositionsController.name);
  
  constructor(private readonly service: PositionsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreatePositionDto) {
    this.logger.log('POST /positions - create request');
    return await this.service.create(dto);
  }

  @Get()
  async findAll() {
    this.logger.log('GET /positions - find all request');
    return await this.service.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    this.logger.log(`GET /positions/${id} - find one request`);
    return await this.service.findOne(id);
  }

  @Patch(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePositionDto) {
    this.logger.log(`PATCH /positions/${id} - update request`);
    return await this.service.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  // Выполняет мягкое удаление должности
  async remove(@Param('id', ParseIntPipe) id: number) {
    this.logger.log(`DELETE /positions/${id} - remove request`);
    return await this.service.remove(id);
  }

  /**
   * Восстановить удалённую должность
   */
  @Post(':id/restore')
  @HttpCode(HttpStatus.OK)
  async restore(@Param('id', ParseIntPipe) id: number) {
    this.logger.log(`POST /positions/${id}/restore - restore request`);
    return await this.service.restore(id);
  }
}