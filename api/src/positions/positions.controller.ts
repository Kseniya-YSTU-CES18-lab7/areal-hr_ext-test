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
  Logger,
  Query,
  UseGuards,  
} from '@nestjs/common';

import { PositionsService } from './positions.service';
import { CreatePositionDto } from './dto/create-position.dto';
import { UpdatePositionDto } from './dto/update-position.dto';
import { PositionResponseDto } from './dto/position.response.dto';
import { RolesGuard } from '../common/guards/roles.guard';  
import { Roles } from '../common/decorators/roles.decorator';
import { SessionGuard } from '../common/guards/session.guard';  

@Controller('positions')
export class PositionsController {
  private readonly logger = new Logger(PositionsController.name);
  
  constructor(private readonly service: PositionsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(SessionGuard, RolesGuard)  
  @Roles('admin', 'manager')  
  async create(@Body() dto: CreatePositionDto): Promise<PositionResponseDto> {
    this.logger.log('POST /positions - create request');
    return (await this.service.create(dto)) as any;
  }

  @Get()
  @UseGuards(SessionGuard)  
  async findAll(
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string
  ): Promise<{ data: PositionResponseDto[]; total: number; page: number; limit: number }> {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;
    this.logger.log(`GET /positions - find all request: page=${pageNum}, limit=${limitNum}, search=${search}`);
    const result = await this.service.findAll(search, pageNum, limitNum);
    return result as any;
  }

  @Get(':id')
  @UseGuards(SessionGuard)  
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<PositionResponseDto> {
    this.logger.log(`GET /positions/${id} - find one request`);
    return (await this.service.findOne(id)) as any;
  }

  @Patch(':id')
  @UseGuards(SessionGuard, RolesGuard)  
  @Roles('admin', 'manager') 
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePositionDto): Promise<PositionResponseDto> {
    this.logger.log(`PATCH /positions/${id} - update request`);
    return (await this.service.update(id, dto)) as any;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(SessionGuard, RolesGuard)  
  @Roles('admin')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    this.logger.log(`DELETE /positions/${id} - remove request`);
    return await this.service.remove(id);
  }

  @Post(':id/restore')
  @HttpCode(HttpStatus.OK)
  @UseGuards(SessionGuard, RolesGuard)  
  @Roles('admin')
  async restore(@Param('id', ParseIntPipe) id: number): Promise<void> {
    this.logger.log(`POST /positions/${id}/restore - restore request`);
    return await this.service.restore(id);
  }
}