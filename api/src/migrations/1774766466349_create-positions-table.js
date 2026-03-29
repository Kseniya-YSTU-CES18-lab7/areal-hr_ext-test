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
  pgm.createTable('positions', {
    id: { type: 'serial', primaryKey: true, comment: 'Уникальный идентификатор должности' },
    name: { type: 'varchar(255)', notNull: true, unique: true, comment: 'Название должности (уникальное)' },
    ...shorthands.timestamps,
  });

  // Уникальный индекс для названия
  pgm.createIndex('positions', 'name', { name: 'idx_positions_name_unique', unique: true });
  pgm.createIndex('positions', 'deleted_at', { name: 'idx_positions_deleted_at' });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 */
export const down = (pgm) => {
  pgm.dropTable('positions');
};