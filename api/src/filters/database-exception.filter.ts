import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { QueryFailedError } from 'typeorm';

/**
 * Глобальный фильтр для обработки ошибок базы данных (TypeORM)
 * Перехватывает QueryFailedError и возвращает понятные клиенту ответы
 */
@Catch(QueryFailedError)
export class DatabaseExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(DatabaseExceptionFilter.name);

  catch(exception: QueryFailedError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    this.logger.error(
      `Database error: ${exception.message}`,
      exception.stack,
    );

    // Извлекаем код ошибки из драйвера PostgreSQL
    const driverError: any = (exception as any).driverError;
    const code = driverError?.code;
    const detail = driverError?.detail;
    const table = driverError?.table;

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Произошла ошибка при работе с базой данных';

    // Обработка конкретных кодов ошибок PostgreSQL
    switch (code) {
      // === Нарушение уникальности (23505) ===
      case '23505':
        status = HttpStatus.CONFLICT; // 409
        // Пытаемся извлечь имя поля из detail
        const uniqueMatch = detail?.match(/Key \(([^)]+)\)/);
        const fieldName = uniqueMatch ? uniqueMatch[1] : 'поле';
        message = `Запись с таким ${this.getFieldName(fieldName)} уже существует`;
        break;

      // === Нарушение внешнего ключа (23503) ===
      case '23503':
        status = HttpStatus.BAD_REQUEST; // 400
        message = 'Связанная запись не найдена. Проверьте корректность данных';
        break;

      // === Нарушение NOT NULL (23502) ===
      case '23502':
        status = HttpStatus.BAD_REQUEST; // 400
        const nullMatch = detail?.match(/column "([^"]+)"/);
        const nullField = nullMatch ? nullMatch[1] : 'обязательное поле';
        message = `Поле "${this.getFieldName(nullField)}" не может быть пустым`;
        break;

      // === Нарушение CHECK constraint (23514) ===
      case '23514':
        status = HttpStatus.BAD_REQUEST; // 400
        message = 'Некорректное значение поля. Проверьте формат данных';
        break;

      // === Таблица/колонка не существует (42P01 / 42703) ===
      case '42P01':
      case '42703':
        status = HttpStatus.INTERNAL_SERVER_ERROR; // 500
        message = 'Внутренняя ошибка сервера. Обратитесь к администратору';
        // В продакшене можно логировать детальнее, но не показывать клиенту
        break;

      // === Ошибка подключения к БД (08001 / 08006) ===
      case '08001':
      case '08006':
        status = HttpStatus.SERVICE_UNAVAILABLE; // 503
        message = 'Сервис временно недоступен. Попробуйте позже';
        break;

      // === Другие ошибки БД ===
      default:
        // В продакшене не показываем детали ошибки клиенту
        message = 'Произошла ошибка при обработке запроса';
        break;
    }

    // Формируем ответ
    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
      // В режиме разработки можно добавить детальную информацию (опционально)
      ...(process.env.NODE_ENV === 'development' && {
        debug: {
          code,
          table,
          detail: driverError?.detail,
        },
      }),
    };

    // Отправляем ответ клиенту
    response.status(status).json(errorResponse);
  }

  /**
   * Преобразует snake_case имя поля в читаемое название на русском
   * Пример: 'organization_id' - 'организации'
   */
  private getFieldName(snakeCase: string): string {
    const fieldMap: Record<string, string> = {
      name: 'названием',
      organization_id: 'организацией',
      parent_id: 'родительским отделом',
      employee_id: 'сотрудником',
      department_id: 'отделом',
      position_id: 'должностью',
      user_id: 'пользователем',
      surname: 'фамилией',
      first_name: 'именем',
      email: 'email',
      login: 'логином',
    };

    return fieldMap[snakeCase] || snakeCase.replace(/_/g, ' ');
  }
}