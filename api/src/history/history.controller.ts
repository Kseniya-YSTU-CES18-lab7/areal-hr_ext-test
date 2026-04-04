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
  Logger 
} from '@nestjs/common';
import { HistoryService } from './history.service';
import { CreateHistoryDto } from './dto/create-history.dto';

/**
 * Контроллер для управления историей изменений (аудит)
 * // Т.к история — это лог событий, записи не изменяются и не удаляются, поэтому методов update, delete, restore нет.
 */
@Controller('history')
export class HistoryController {
  private readonly logger = new Logger(HistoryController.name);

  constructor(private readonly service: HistoryService) {}

  // Создание записи в истории
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateHistoryDto) {
    this.logger.log('POST /history - create request');
    return await this.service.create(dto);
  }

  // Получение всех записей истории (последние 100)
  @Get()
  async findAll() {
    this.logger.log('GET /history - find all request');
    return await this.service.findAll();
  }

  // Получение истории по типу и ID сущности
  @Get('by-entity')
  async findByEntity(
    @Query('entity_type') entityType: string,
    @Query('entity_id') entityId: string
  ) {
    this.logger.log(`GET /history/by-entity - find by entity: ${entityType}/${entityId}`);
    return await this.service.findByEntity(entityType, entityId);
  }

  // Получение истории по ID пользователя
  @Get('by-user/:userId')
  async findByUserId(@Param('userId') userId: string) {
    this.logger.log(`GET /history/by-user/${userId} - find by user request`);
    return await this.service.findByUserId(userId);
  }

  // Получение записи истории по ID
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    this.logger.log(`GET /history/${id} - find one request`);
    return await this.service.findOne(id);
  }
}