import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  Query,
  ParseUUIDPipe,
  ParseIntPipe, 
  HttpCode, 
  HttpStatus, 
  Logger,
  UseGuards,
  Request, 
} from '@nestjs/common';

import { EmployeesService } from './employees.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { EmployeeResponseDto } from './dto/employee.response.dto';
import { CreateEmployeeFullDto } from './dto/create-employee-full.dto';
import { RolesGuard } from '../common/guards/roles.guard';  
import { Roles } from '../common/decorators/roles.decorator';  
import { SessionGuard } from '../common/guards/session.guard';  

/**
 * Контроллер для управления сотрудниками
 * REST API эндпоинты: POST/GET/PATCH/DELETE
 */
@Controller('employees')
export class EmployeesController {
  private readonly logger = new Logger(EmployeesController.name);

  constructor(private readonly service: EmployeesService) {}

  // Создание сотрудника
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(SessionGuard, RolesGuard)  
  @Roles('admin', 'manager')  
  async create(@Request() req, @Body() dto: CreateEmployeeDto): Promise<EmployeeResponseDto> {
    // ОТЛАДКА:
    //console.log('🔍 DEBUG create - req.user:', JSON.stringify(req.user, null, 2));
    //console.log('🔍 DEBUG create - userId to pass:', req.user?.id);
    
    this.logger.log('POST /employees - create request');
    
    // Передаём userId, если есть
    const userId = req.user?.id ?? '00000000-0000-4000-8000-000000000000';
    //console.log('🔍 DEBUG create - final userId:', userId);
    
    return (await this.service.create(dto, userId)) as any;
  }

  /**
   * Создание сотрудника с паспортом и адресом в одном запросе (транзакция)
   */
  @Post('full')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(SessionGuard, RolesGuard)  
  @Roles('admin', 'manager')  
  async createFull(@Request() req, @Body() dto: CreateEmployeeFullDto): Promise<EmployeeResponseDto> {
    this.logger.log('POST /employees/full - create with passport and address (transaction)');
    return (await this.service.createFull(dto, req.user?.id)) as any;
  }

  // Получение списка всех сотрудников с фильтрацией
  @Get()
  @UseGuards(SessionGuard, RolesGuard)  
  @Roles('admin', 'manager') 
  async findAll(
    @Query('surname') surname?: string,
    @Query('firstName') firstName?: string,
    @Query('departmentId') departmentId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string
  ): Promise<{ data: EmployeeResponseDto[]; total: number; page: number; limit: number }> {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;
    this.logger.log(`GET /employees - find all with filters: surname=${surname}, firstName=${firstName}, departmentId=${departmentId}, page=${pageNum}, limit=${limitNum}`);
    
    const result = await this.service.findAll(
      { surname, firstName, departmentId: departmentId ? +departmentId : undefined },
      pageNum,
      limitNum
    );
    return result as any;
  }

  // Получение уволенных сотрудников
  @Get('fired')
  @UseGuards(SessionGuard, RolesGuard)  
  @Roles('admin', 'manager')  
  async findFired(): Promise<EmployeeResponseDto[]> {
    this.logger.log('GET /employees/fired - find fired employees');
    return (await this.service.findFired()) as any;
  }

  // Получение сотрудника по ID (UUID)
  @Get(':id')
  @UseGuards(SessionGuard, RolesGuard)  
  @Roles('admin', 'manager')  
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<EmployeeResponseDto> {
    this.logger.log(`GET /employees/${id} - find one request`);
    return (await this.service.findOne(id)) as any;
  }

  // Получение сотрудников по отделу
  @Get('by-department/:departmentId')
  @UseGuards(SessionGuard, RolesGuard)  
  @Roles('admin', 'manager')  
  async findByDepartment(@Param('departmentId', ParseIntPipe) departmentId: number): Promise<EmployeeResponseDto[]> {
    this.logger.log(`GET /employees/by-department/${departmentId} - find by department`);
    return (await this.service.findAll({ departmentId })) as any;
  }

  // Обновление сотрудника
  @Patch(':id')
  @UseGuards(SessionGuard, RolesGuard)  
  @Roles('admin', 'manager') 
  async update(@Request() req, @Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateEmployeeDto): Promise<EmployeeResponseDto> {
    this.logger.log(`PATCH /employees/${id} - update request`, dto); 
    this.logger.log(`🔍 DEBUG: dto.departmentId =`, (dto as any).departmentId);  
    return (await this.service.update(id, dto, req.user?.id)) as any;
  }

  // Мягкое удаление сотрудника
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(SessionGuard, RolesGuard)  
  @Roles('admin', 'manager')  
  async remove(@Request() req, @Param('id', ParseUUIDPipe) id: string): Promise<void> {
    this.logger.log(`DELETE /employees/${id} - remove request`);
    return await this.service.remove(id, req.user?.id);
  }

  // Восстановление удалённого сотрудника
  @Post(':id/restore')
  @HttpCode(HttpStatus.OK)
  @UseGuards(SessionGuard, RolesGuard)  
  @Roles('admin', 'manager')  
  async restore(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    this.logger.log(`POST /employees/${id}/restore - restore request`);
    return await this.service.restore(id);
  }
}