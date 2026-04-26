import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  Query,
  ParseUUIDPipe, 
  HttpCode, 
  HttpStatus, 
  Logger,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { UserResponseDto } from './dto/user.response.dto';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('users')
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(private readonly service: UsersService) {}

  /**
   * Создание пользователя (только для админов)
   */
  @UseGuards(AuthGuard('local'), RolesGuard)
  @Roles('admin')
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateUserDto): Promise<UserResponseDto> {
    this.logger.log('POST /users - create request');
    return (await this.service.create(dto)) as any;
  }

  /**
   * Получение всех пользователей (только для админов)
   */
  @UseGuards(AuthGuard('local'), RolesGuard)
  @Roles('admin')
  @Get()
  async findAll(
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string
  ): Promise<{ data: UserResponseDto[]; total: number; page: number; limit: number }> {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;
    this.logger.log(`GET /users - find all: page=${pageNum}, limit=${limitNum}, search=${search}`);
    const result = await this.service.findAll(search, pageNum, limitNum);
    return result as any;
  }

  /**
   * Получение пользователя по ID (только для админов)
   */
  @UseGuards(AuthGuard('local'), RolesGuard)
  @Roles('admin')
  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<UserResponseDto> {
    this.logger.log(`GET /users/${id} - find one request`);
    return (await this.service.findOne(id)) as any;
  }

  /**
   * Обновление пользователя (только для админов)
   */
  @UseGuards(AuthGuard('local'), RolesGuard)
  @Roles('admin')
  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string, 
    @Body() dto: UpdateUserDto
  ): Promise<UserResponseDto> {
    this.logger.log(`PATCH /users/${id} - update request`);
    return (await this.service.update(id, dto)) as any;
  }

  /**
   * Мягкое удаление пользователя (только для админов)
   */
  @UseGuards(AuthGuard('local'), RolesGuard)
  @Roles('admin')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    this.logger.log(`DELETE /users/${id} - remove request`);
    await this.service.remove(id);
  }

  /**
   * Восстановление пользователя (только для админов)
   */
  @UseGuards(AuthGuard('local'), RolesGuard)
  @Roles('admin')
  @Post(':id/restore')
  @HttpCode(HttpStatus.OK)
  async restore(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    this.logger.log(`POST /users/${id}/restore - restore request`);
    await this.service.restore(id);
  }
}