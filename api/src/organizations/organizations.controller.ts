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
  findAll() {
    return this.service.findAll();
  }

  /**
   * Найти организацию по ID
   */
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  /**
   * Обновить организацию
   */
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateOrganizationDto) {
    return this.service.update(id, dto);
  }

  /**
   * Мягкое удаление организации
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}