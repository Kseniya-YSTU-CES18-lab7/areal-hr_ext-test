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
  Logger 
} from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';

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
  async create(@Body() dto: CreateEmployeeDto) {
    this.logger.log('POST /employees - create request');
    return await this.service.create(dto);
  }

// Получение списка всех сотрудников с фильтрацией
  @Get()
  async findAll(
    @Query('surname') surname?: string,
    @Query('firstName') firstName?: string,
    @Query('departmentId') departmentId?: string,
  ) {
    this.logger.log(`GET /employees - find all with filters: surname=${surname}, firstName=${firstName}, departmentId=${departmentId}`);
    return await this.service.findAll({ surname, firstName, departmentId: departmentId ? +departmentId : undefined });
  }

  // Получение уволенных сотрудников
  @Get('fired')
  async findFired() {
  this.logger.log('GET /employees/fired - find fired employees');
  return await this.service.findFired();
}

  // Получение сотрудника по ID (UUID)
  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    this.logger.log(`GET /employees/${id} - find one request`);
    return await this.service.findOne(id);
  }

// Получение сотрудников по отделу
@Get('by-department/:departmentId')
async findByDepartment(@Param('departmentId', ParseIntPipe) departmentId: number) {
  this.logger.log(`GET /employees/by-department/${departmentId} - find by department`);
  return await this.service.findAll({ departmentId });
}

  // Обновление сотрудника
  @Patch(':id')
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateEmployeeDto) {
    this.logger.log(`PATCH /employees/${id} - update request`);
    return await this.service.update(id, dto);
  }

  // Мягкое удаление сотрудника
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    this.logger.log(`DELETE /employees/${id} - remove request`);
    return await this.service.remove(id);
  }

  // Восстановление удалённого сотрудника
  @Post(':id/restore')
  @HttpCode(HttpStatus.OK)
  async restore(@Param('id', ParseUUIDPipe) id: string) {
    this.logger.log(`POST /employees/${id}/restore - restore request`);
    return await this.service.restore(id);
  }
}