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
  HttpStatus
} from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';

/**
 * Контроллер для обработки HTTP-запросов к организациям
 */
@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly service: OrganizationsService) {}

  /**
   * Создать организацию
   */
@Post()
@HttpCode(HttpStatus.CREATED)
async create(@Body() dto: CreateOrganizationDto) {
  try {
      console.log('! [CONTROLLER] POST /organizations вызван!');
    console.log('Поиск [Controller] Creating:', dto);  // ← Лог для отладки
    const result = await this.service.create(dto);
    console.log('+ [Controller] Created:', result);  // ← Лог результата
    return result;
  } catch (error) {
    console.error('- [Controller] Error:', error.message);  // ← Лог ошибки
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