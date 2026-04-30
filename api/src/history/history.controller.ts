import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  Query, 
  ParseIntPipe, 
  HttpCode, 
  HttpStatus, 
  Logger,
  UseGuards,  
} from '@nestjs/common';

import { HistoryService } from './history.service';
import { CreateHistoryDto } from './dto/create-history.dto';
import { HistoryResponseDto } from './dto/history.response.dto';
import { RolesGuard } from '../common/guards/roles.guard';  
import { Roles } from '../common/decorators/roles.decorator';
import { SessionGuard } from '../common/guards/session.guard';  

/**
 * Контроллер для управления историей изменений (аудит)
 * // Т.к история — это лог событий, записи не изменяются и не удаляются, поэтому методов update, delete, restore нет.
 */
@Controller('history')
export class HistoryController {
  private readonly logger = new Logger(HistoryController.name);

  constructor(private readonly service: HistoryService) {}

  // Создание записи в истории (обычно вызывается автоматически, но защитим)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(SessionGuard, RolesGuard)  
  @Roles('admin', 'manager')
  async create(@Body() dto: CreateHistoryDto): Promise<HistoryResponseDto> {
    this.logger.log('POST /history - create request');
    return (await this.service.create(dto)) as any;
  }

  // Получение всех записей истории (аудит — только для админов)
  @Get()
  @UseGuards(SessionGuard, RolesGuard)  
  @Roles('admin')
  async findAll(
    @Query('entityType') entityType?: string,
    @Query('operationType') operationType?: string,
    @Query('entityId') entityId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string
  ): Promise<{ data: HistoryResponseDto[]; total: number; page: number; limit: number }> {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;
    this.logger.log(`GET /history - find all request: page=${pageNum}, limit=${limitNum}, filters: entityType=${entityType}, operationType=${operationType}, entityId=${entityId}`);
    const result = await this.service.findAll(
      { entityType, operationType, entityId },
      pageNum,
      limitNum
    );
    return result as any;
  }

  // Получение истории по типу и ID сущности
  @Get('by-entity')
  @UseGuards(SessionGuard, RolesGuard)  
  @Roles('admin')
  async findByEntity(
    @Query('entity_type') entityType: string,
    @Query('entity_id') entityId: string
  ): Promise<HistoryResponseDto[]> {
    this.logger.log(`GET /history/by-entity - find by entity: ${entityType}/${entityId}`);
    return (await this.service.findByEntity(entityType, entityId)) as any;
  }

  // Получение истории по ID пользователя
  @Get('by-user/:userId')
  @UseGuards(SessionGuard, RolesGuard)  
  @Roles('admin')
  async findByUserId(@Param('userId') userId: string): Promise<HistoryResponseDto[]> {
    this.logger.log(`GET /history/by-user/${userId} - find by user request`);
    return (await this.service.findByUserId(userId)) as any;
  }

  // Получение записи истории по ID
  @Get(':id')
  @UseGuards(SessionGuard, RolesGuard)  
  @Roles('admin')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<HistoryResponseDto> {
    this.logger.log(`GET /history/${id} - find one request`);
    return (await this.service.findOne(id)) as any;
  }
}