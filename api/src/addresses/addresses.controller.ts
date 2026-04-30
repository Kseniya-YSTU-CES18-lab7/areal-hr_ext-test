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
  UseGuards,  
} from '@nestjs/common';
import { AddressesService } from './addresses.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { AddressResponseDto } from './dto/address.response.dto';
import { RolesGuard } from '../common/guards/roles.guard';  
import { Roles } from '../common/decorators/roles.decorator';  
import { SessionGuard } from '../common/guards/session.guard'; 

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
  @UseGuards(SessionGuard, RolesGuard)  
  @Roles('admin', 'manager')  
  async create(@Body() dto: CreateAddressDto): Promise<AddressResponseDto> {
    this.logger.log('POST /addresses - create request');
    return (await this.service.create(dto)) as any;
  }

  // Получение всех адресов
  @Get()
  @UseGuards(SessionGuard, RolesGuard) 
  @Roles('admin', 'manager')  
  async findAll(): Promise<AddressResponseDto[]> {
    this.logger.log('GET /addresses - find all request');
    return (await this.service.findAll()) as any;
  }

  // Получение адреса по ID сотрудника
  @Get('by-employee/:employeeId')
  @UseGuards(SessionGuard, RolesGuard)  
  @Roles('admin', 'manager')
  async findByEmployeeId(@Param('employeeId') employeeId: string): Promise<AddressResponseDto> {
    this.logger.log(`GET /addresses/by-employee/${employeeId} - find by employee request`);
    return (await this.service.findByEmployeeId(employeeId)) as any;
  }

  // Получение адреса по ID
  @Get(':id')
  @UseGuards(SessionGuard, RolesGuard)
  @Roles('admin', 'manager')  
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<AddressResponseDto> {
    this.logger.log(`GET /addresses/${id} - find one request`);
    return (await this.service.findOne(id)) as any;
  }

  // Обновление адреса
  @Patch(':id')
  @UseGuards(SessionGuard, RolesGuard)  
  @Roles('admin', 'manager')  
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateAddressDto): Promise<AddressResponseDto> {
    this.logger.log(`PATCH /addresses/${id} - update request`);
    return (await this.service.update(id, dto)) as any;
  }

  // Мягкое удаление адреса
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(SessionGuard, RolesGuard) 
  @Roles('admin')  // (только админ)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    this.logger.log(`DELETE /addresses/${id} - remove request`);
    return await this.service.remove(id);
  }

  // Восстановление адреса
  @Post(':id/restore')
  @HttpCode(HttpStatus.OK)
  @UseGuards(SessionGuard, RolesGuard)  
  @Roles('admin')  // (только админ)
  async restore(@Param('id', ParseIntPipe) id: number): Promise<void> {
    this.logger.log(`POST /addresses/${id} - restore request`);
    return await this.service.restore(id);
  }
}