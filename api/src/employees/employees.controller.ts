import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  ParseUUIDPipe, 
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

  // Получение списка всех сотрудников
  @Get()
  async findAll() {
    this.logger.log('GET /employees - find all request');
    return await this.service.findAll();
  }

  // Получение сотрудника по ID (UUID)
  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    this.logger.log(`GET /employees/${id} - find one request`);
    return await this.service.findOne(id);
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