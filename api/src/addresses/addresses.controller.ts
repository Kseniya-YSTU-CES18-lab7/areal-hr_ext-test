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
import { AddressesService } from './addresses.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

/**
 * Контроллер для управления адресами регистрации
 * Связь с сотрудником: 1:1
 */
@Controller('addresses')
export class AddressesController {
  private readonly logger = new Logger(AddressesController.name);

  constructor(private readonly service: AddressesService) {}

  // Создание адреса
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateAddressDto) {
    this.logger.log('POST /addresses - create request');
    return await this.service.create(dto);
  }

  // Получение всех адресов
  @Get()
  async findAll() {
    this.logger.log('GET /addresses - find all request');
    return await this.service.findAll();
  }

  // Получение адреса по ID сотрудника
  @Get('by-employee/:employeeId')
  async findByEmployeeId(@Param('employeeId') employeeId: string) {
    this.logger.log(`GET /addresses/by-employee/${employeeId} - find by employee request`);
    return await this.service.findByEmployeeId(employeeId);
  }

  // Получение адреса по ID
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    this.logger.log(`GET /addresses/${id} - find one request`);
    return await this.service.findOne(id);
  }

  // Обновление адреса
  @Patch(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateAddressDto) {
    this.logger.log(`PATCH /addresses/${id} - update request`);
    return await this.service.update(id, dto);
  }

  // Мягкое удаление адреса
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number) {
    this.logger.log(`DELETE /addresses/${id} - remove request`);
    return await this.service.remove(id);
  }

  // Восстановление адреса
  @Post(':id/restore')
  @HttpCode(HttpStatus.OK)
  async restore(@Param('id', ParseIntPipe) id: number) {
    this.logger.log(`POST /addresses/${id}/restore - restore request`);
    return await this.service.restore(id);
  }
}