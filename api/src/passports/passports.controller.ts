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
import { PassportResponseDto } from './dto/passport.response.dto';  

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
  async create(@Body() dto: CreatePassportDto): Promise<PassportResponseDto> {
    this.logger.log('POST /passports - create request');
    return (await this.service.create(dto)) as any;
  }

  // Получение всех паспортов
  @Get()
  async findAll(): Promise<PassportResponseDto[]> {
    this.logger.log('GET /passports - find all request');
    return (await this.service.findAll()) as any;
  }

  // Получение паспорта по ID сотрудника
  @Get('by-employee/:employeeId')
  async findByEmployeeId(@Param('employeeId') employeeId: string): Promise<PassportResponseDto> {
    this.logger.log(`GET /passports/by-employee/${employeeId} - find by employee request`);
    return (await this.service.findByEmployeeId(employeeId)) as any;
  }

  // Получение паспорта по ID
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<PassportResponseDto> {
    this.logger.log(`GET /passports/${id} - find one request`);
    return (await this.service.findOne(id)) as any;
  }

  // Обновление паспорта
  @Patch(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePassportDto): Promise<PassportResponseDto> {
    this.logger.log(`PATCH /passports/${id} - update request`);
    return (await this.service.update(id, dto)) as any;
  }

  // Мягкое удаление паспорта
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    this.logger.log(`DELETE /passports/${id} - remove request`);
    return await this.service.remove(id);
  }

  // Восстановление паспорта
  @Post(':id/restore')
  @HttpCode(HttpStatus.OK)
  async restore(@Param('id', ParseIntPipe) id: number): Promise<void> {
    this.logger.log(`POST /passports/${id}/restore - restore request`);
    return await this.service.restore(id);
  }
}