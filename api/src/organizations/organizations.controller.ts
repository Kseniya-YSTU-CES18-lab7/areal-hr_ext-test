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
  UseInterceptors,
  ClassSerializerInterceptor,
  Query
} from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { OrganizationResponseDto } from './dto/organization.response.dto';

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
  @UseInterceptors(ClassSerializerInterceptor)
  async create(@Body() dto: CreateOrganizationDto): Promise<OrganizationResponseDto> {
    this.logger.log(`POST /organizations - create request: ${dto.name}`);
    const result = await this.service.create(dto);
    this.logger.log(`Organization created: ${result.id}`);
    return result;
  }

  /**
   * Получить список всех активных организаций
   */
  @Get()
  @UseInterceptors(ClassSerializerInterceptor)
  async findAll(
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string
  ): Promise<{ data: OrganizationResponseDto[]; total: number; page: number; limit: number }> {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;
    this.logger.log(`GET /organizations - find all request: page=${pageNum}, limit=${limitNum}, search=${search}`);
    const result = await this.service.findAll(search, pageNum, limitNum);
    return result as any;
  }

  /**
   * Найти организацию по ID
   */
  @Get(':id')
  @UseInterceptors(ClassSerializerInterceptor)
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<OrganizationResponseDto> {
    this.logger.log(`GET /organizations/${id} - find one request`);
    return await this.service.findOne(id);
  }

  /**
   * Обновить организацию
   */
  @Patch(':id')
  @UseInterceptors(ClassSerializerInterceptor)
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateOrganizationDto): Promise<OrganizationResponseDto> {
    this.logger.log(`PATCH /organizations/${id} - update request`);
    return await this.service.update(id, dto);
  }

  /**
   * Мягкое удаление организации
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    this.logger.log(`DELETE /organizations/${id} - remove request`);
    return await this.service.remove(id);
  }

  /**
   * Восстановить удалённую организацию
   */
  @Post(':id/restore')
  @HttpCode(HttpStatus.OK)
  async restore(@Param('id', ParseIntPipe) id: number): Promise<void> {
    this.logger.log(`POST /organizations/${id}/restore - restore request`);
    return await this.service.restore(id);
  }
}