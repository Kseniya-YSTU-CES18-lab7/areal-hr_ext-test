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
import { DepartmentResponseDto } from './dto/department.response.dto';

@Controller('departments')
export class DepartmentsController {
  private readonly logger = new Logger(DepartmentsController.name);
  
  constructor(private readonly service: DepartmentsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateDepartmentDto): Promise<DepartmentResponseDto> {
    this.logger.log('POST /departments - create request');
    return (await this.service.create(dto)) as any;
  }

  @Get()
  async findAll(
    @Query('organizationId') organizationId?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string
  ): Promise<{ data: DepartmentResponseDto[]; total: number; page: number; limit: number }> {
    const orgId = organizationId ? parseInt(organizationId, 10) : undefined;
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;
    this.logger.log(`GET /departments - find all request: orgId=${orgId}, search=${search}, page=${pageNum}, limit=${limitNum}`);
    const result = await this.service.findAll(orgId, search, pageNum, limitNum);
    return result as any;
  }

  @Get('tree')
  async findTree(@Query('organizationId', ParseIntPipe) organizationId: number): Promise<DepartmentResponseDto[]> {
    this.logger.log(`GET /departments/tree - tree request for org ${organizationId}`);
    return (await this.service.findTree(organizationId)) as any;
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<DepartmentResponseDto> {
    this.logger.log(`GET /departments/${id} - find one request`);
    return (await this.service.findOne(id)) as any;
  }

  @Patch(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateDepartmentDto): Promise<DepartmentResponseDto> {
    this.logger.log(`PATCH /departments/${id} - update request`);
    return (await this.service.update(id, dto)) as any;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    this.logger.log(`DELETE /departments/${id} - remove request`);
    return await this.service.remove(id);
  }

  @Post(':id/restore')
  @HttpCode(HttpStatus.OK)
  async restore(@Param('id', ParseIntPipe) id: number): Promise<void> {
    this.logger.log(`POST /departments/${id}/restore - restore request`);
    return await this.service.restore(id);
  }
}