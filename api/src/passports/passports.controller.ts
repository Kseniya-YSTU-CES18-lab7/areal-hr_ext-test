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
import { PassportsService } from './passports.service';
import { CreatePassportDto } from './dto/create-passport.dto';
import { UpdatePassportDto } from './dto/update-passport.dto';

/**
 * Контроллер для управления паспортными данными
 * Связь с сотрудником: 1:1
 */
@Controller('passports')
export class PassportsController {
  private readonly logger = new Logger(PassportsController.name);

  constructor(private readonly service: PassportsService) {}

  // Создание паспорта
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreatePassportDto) {
    this.logger.log('POST /passports - create request');
    return await this.service.create(dto);
  }

  // Получение всех паспортов
  @Get()
  async findAll() {
    this.logger.log('GET /passports - find all request');
    return await this.service.findAll();
  }

  // Получение паспорта по ID сотрудника
  @Get('by-employee/:employeeId')
  async findByEmployeeId(@Param('employeeId') employeeId: string) {
    this.logger.log(`GET /passports/by-employee/${employeeId} - find by employee request`);
    return await this.service.findByEmployeeId(employeeId);
  }

  // Получение паспорта по ID
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    this.logger.log(`GET /passports/${id} - find one request`);
    return await this.service.findOne(id);
  }

  // Обновление паспорта
  @Patch(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePassportDto) {
    this.logger.log(`PATCH /passports/${id} - update request`);
    return await this.service.update(id, dto);
  }

  // Мягкое удаление паспорта
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number) {
    this.logger.log(`DELETE /passports/${id} - remove request`);
    return await this.service.remove(id);
  }

  // Восстановление паспорта
  @Post(':id/restore')
  @HttpCode(HttpStatus.OK)
  async restore(@Param('id', ParseIntPipe) id: number) {
    this.logger.log(`POST /passports/${id}/restore - restore request`);
    return await this.service.restore(id);
  }
}