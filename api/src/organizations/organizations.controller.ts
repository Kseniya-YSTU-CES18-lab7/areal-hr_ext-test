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
import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';

/**
 * Контроллер для обработки HTTP-запросов к организациям
 */
@Controller('organizations')
export class OrganizationsController {
  private readonly logger = new Logger(OrganizationsController.name);  

  constructor(private readonly service: OrganizationsService) {}

  /**
   * Создать организацию
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateOrganizationDto) {
    try {
      this.logger.log('! [CONTROLLER] POST /organizations вызван!');
      this.logger.log(`Поиск [Controller] Creating: ${JSON.stringify(dto)}`);
      
      const result = await this.service.create(dto);
      
      this.logger.log(`+ [Controller] Created: ${JSON.stringify(result)}`);
      return result;
    } catch (error) {
      this.logger.error(`- [Controller] Error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Получить список всех активных организаций
   */
  @Get()
  async findAll() {
    this.logger.log('GET /organizations - find all request');
    return await this.service.findAll();
  }

  /**
   * Найти организацию по ID
   */
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    this.logger.log(`GET /organizations/${id} - find one request`);
    return await this.service.findOne(id);
  }

  /**
   * Обновить организацию
   */
  @Patch(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateOrganizationDto) {
    this.logger.log(`PATCH /organizations/${id} - update request`);
    return await this.service.update(id, dto);
  }

  /**
   * Мягкое удаление организации
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number) {
    this.logger.log(`DELETE /organizations/${id} - remove request`);
    return await this.service.remove(id);
  }

  /**
   * Восстановить удалённую организацию
   */
  @Post(':id/restore')
  @HttpCode(HttpStatus.OK)
  async restore(@Param('id', ParseIntPipe) id: number) {
    this.logger.log(`POST /organizations/${id}/restore - restore request`);
    return await this.service.restore(id);
  }
}