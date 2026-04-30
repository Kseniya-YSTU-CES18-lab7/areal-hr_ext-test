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
  UseGuards,
  Request,
} from '@nestjs/common';

import { HrOperationsService } from './hr-operations.service';
import { CreateHrOperationDto } from './dto/create-hr-operation.dto';
import { UpdateHrOperationDto } from './dto/update-hr-operation.dto';
import { HrOperationResponseDto } from './dto/hr-operation.response.dto';
import { RolesGuard } from '../common/guards/roles.guard';  
import { Roles } from '../common/decorators/roles.decorator';
import { SessionGuard } from '../common/guards/session.guard';  

/**
 * Контроллер для управления кадровыми операциями
 * Типы операций: hire, change_salary, change_department, dismissal
 */
@Controller('hr-operations')
export class HrOperationsController {
  private readonly logger = new Logger(HrOperationsController.name);

  constructor(private readonly service: HrOperationsService) {}

  // Создание кадровой операции
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(SessionGuard, RolesGuard)  
  @Roles('admin', 'manager') 
  async create(@Request() req, @Body() dto: CreateHrOperationDto): Promise<HrOperationResponseDto> {
    this.logger.log('POST /hr-operations - create request');
    return (await this.service.create(dto, req.user?.id)) as any;
  }

  // Получение всех операций
  @Get()
  @UseGuards(SessionGuard, RolesGuard)  
  @Roles('admin', 'manager')
  async findAll(): Promise<HrOperationResponseDto[]> {
    this.logger.log('GET /hr-operations - find all request');
    return (await this.service.findAll()) as any;
  }

  // Получение всех операций сотрудника
  @Get('by-employee/:employeeId')
  @UseGuards(SessionGuard, RolesGuard)  
  @Roles('admin', 'manager')  
  async findByEmployeeId(@Param('employeeId') employeeId: string): Promise<HrOperationResponseDto[]> {
    this.logger.log(`GET /hr-operations/by-employee/${employeeId} - find by employee request`);
    return (await this.service.findByEmployeeId(employeeId)) as any;
  }

  // Получение операции по ID
  @Get(':id')
  @UseGuards(SessionGuard, RolesGuard)  
  @Roles('admin', 'manager')  
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<HrOperationResponseDto> {
    this.logger.log(`GET /hr-operations/${id} - find one request`);
    return (await this.service.findOne(id)) as any;
  }

  // Обновление операции
  @Patch(':id')
  @UseGuards(SessionGuard, RolesGuard)  
  @Roles('admin')
  async update(@Request() req, @Param('id', ParseIntPipe) id: number, @Body() dto: UpdateHrOperationDto): Promise<HrOperationResponseDto> {
    this.logger.log(`PATCH /hr-operations/${id} - update request`);
    return (await this.service.update(id, dto, req.user?.id)) as any;
  }

  // Мягкое удаление операции
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(SessionGuard, RolesGuard)  
  @Roles('admin')  
  async remove(@Request() req, @Param('id', ParseIntPipe) id: number): Promise<void> {
    this.logger.log(`DELETE /hr-operations/${id} - remove request`);
    return await this.service.remove(id, req.user?.id);
  }

  // Восстановление операции
  @Post(':id/restore')
  @HttpCode(HttpStatus.OK)
  @UseGuards(SessionGuard, RolesGuard) 
  @Roles('admin') 
  async restore(@Param('id', ParseIntPipe) id: number): Promise<void> {
    this.logger.log(`POST /hr-operations/${id} - restore request`);
    return await this.service.restore(id);
  }
}