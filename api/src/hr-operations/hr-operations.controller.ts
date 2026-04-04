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
import { HrOperationsService } from './hr-operations.service';
import { CreateHrOperationDto } from './dto/create-hr-operation.dto';
import { UpdateHrOperationDto } from './dto/update-hr-operation.dto';

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
  async create(@Body() dto: CreateHrOperationDto) {
    this.logger.log('POST /hr-operations - create request');
    return await this.service.create(dto);
  }

  // Получение всех операций
  @Get()
  async findAll() {
    this.logger.log('GET /hr-operations - find all request');
    return await this.service.findAll();
  }

  // Получение всех операций сотрудника
  @Get('by-employee/:employeeId')
  async findByEmployeeId(@Param('employeeId') employeeId: string) {
    this.logger.log(`GET /hr-operations/by-employee/${employeeId} - find by employee request`);
    return await this.service.findByEmployeeId(employeeId);
  }

  // Получение операции по ID
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    this.logger.log(`GET /hr-operations/${id} - find one request`);
    return await this.service.findOne(id);
  }

  // Обновление операции
  @Patch(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateHrOperationDto) {
    this.logger.log(`PATCH /hr-operations/${id} - update request`);
    return await this.service.update(id, dto);
  }

  // Мягкое удаление операции
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number) {
    this.logger.log(`DELETE /hr-operations/${id} - remove request`);
    return await this.service.remove(id);
  }

  // Восстановление операции
  @Post(':id/restore')
  @HttpCode(HttpStatus.OK)
  async restore(@Param('id', ParseIntPipe) id: number) {
    this.logger.log(`POST /hr-operations/${id}/restore - restore request`);
    return await this.service.restore(id);
  }
}