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
} from '@nestjs/common';

import { PassportsService } from './passports.service';
import { CreatePassportDto } from './dto/create-passport.dto';
import { UpdatePassportDto } from './dto/update-passport.dto';
import { PassportResponseDto } from './dto/passport.response.dto';
import { RolesGuard } from '../common/guards/roles.guard';  
import { Roles } from '../common/decorators/roles.decorator';
import { SessionGuard } from '../common/guards/session.guard';  

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
  @UseGuards(SessionGuard, RolesGuard)  
  @Roles('admin', 'manager')  
  async create(@Body() dto: CreatePassportDto): Promise<PassportResponseDto> {
    this.logger.log('POST /passports - create request');
    return (await this.service.create(dto)) as any;
  }

  // Получение всех паспортов
  @Get()
  @UseGuards(SessionGuard, RolesGuard)  
  @Roles('admin', 'manager')  
  async findAll(): Promise<PassportResponseDto[]> {
    this.logger.log('GET /passports - find all request');
    return (await this.service.findAll()) as any;
  }

  // Получение паспорта по ID сотрудника
  @Get('by-employee/:employeeId')
  @UseGuards(SessionGuard, RolesGuard)  
  @Roles('admin', 'manager')  
  async findByEmployeeId(@Param('employeeId') employeeId: string): Promise<PassportResponseDto> {
    this.logger.log(`GET /passports/by-employee/${employeeId} - find by employee request`);
    return (await this.service.findByEmployeeId(employeeId)) as any;
  }

  // Получение паспорта по ID
  @Get(':id')
  @UseGuards(SessionGuard, RolesGuard)  
  @Roles('admin', 'manager')  
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<PassportResponseDto> {
    this.logger.log(`GET /passports/${id} - find one request`);
    return (await this.service.findOne(id)) as any;
  }

  // Обновление паспорта
  @Patch(':id')
  @UseGuards(SessionGuard, RolesGuard)  
  @Roles('admin', 'manager')  
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePassportDto): Promise<PassportResponseDto> {
    this.logger.log(`PATCH /passports/${id} - update request`);
    return (await this.service.update(id, dto)) as any;
  }

  // Мягкое удаление паспорта
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(SessionGuard, RolesGuard)  
  @Roles('admin')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    this.logger.log(`DELETE /passports/${id} - remove request`);
    return await this.service.remove(id);
  }

  // Восстановление паспорта
  @Post(':id/restore')
  @HttpCode(HttpStatus.OK)
  @UseGuards(SessionGuard, RolesGuard)  
  @Roles('admin')
  async restore(@Param('id', ParseIntPipe) id: number): Promise<void> {
    this.logger.log(`POST /passports/${id} - restore request`);
    return await this.service.restore(id);
  }
}