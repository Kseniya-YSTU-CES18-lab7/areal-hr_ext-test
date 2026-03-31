/**
 * Миграция. Создание таблицы "Должности"
 */

/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = {
  timestamps: {
    created_at: { type: 'timestamp', default: 'now()', notNull: true, comment: 'Дата и время создания записи' },
    updated_at: { type: 'timestamp', default: 'now()', notNull: true, comment: 'Дата и время последнего обновления' },
    deleted_at: { type: 'timestamp', default: null, comment: 'Дата мягкого удаления (NULL = запись активна)' },
  },
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 */
export const up = (pgm) => {
  // Таблица без unique на колонке
  pgm.createTable('positions', {
    id: { type: 'serial', primaryKey: true, comment: 'Уникальный идентификатор должности' },
    name: { type: 'varchar(255)', notNull: true, comment: 'Название должности' },
    ...shorthands.timestamps,
  });

  // Уникальность только для активных записей
  pgm.sql(`
    CREATE UNIQUE INDEX idx_positions_name_active 
    ON positions (name) 
    WHERE deleted_at IS NULL
  `);

  // Индекс для быстрого поиска по deleted_at
  pgm.createIndex('positions', 'deleted_at', { name: 'idx_positions_deleted_at' });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 */
export const down = (pgm) => {
  // Удаляем таблицу (индексы удалятся автоматически)
  pgm.dropTable('positions');
};