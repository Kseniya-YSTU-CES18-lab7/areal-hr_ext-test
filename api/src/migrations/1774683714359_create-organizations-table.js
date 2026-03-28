// Миграция для создания таблицы organizations (Организации)

/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = {
  timestamps: {
    created_at: { type: 'timestamp', default: 'now()', notNull: true },
    updated_at: { type: 'timestamp', default: 'now()', notNull: true },
    deleted_at: { type: 'timestamp', default: null },
  },
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 */
export const up = (pgm) => {
  pgm.createTable('organizations', {
    id: { type: 'serial', primaryKey: true },
    name: { type: 'varchar(255)', notNull: true },
    comment: { type: 'text' },
    ...shorthands.timestamps,
  });

  // Индекс для быстрого поиска по имени
  pgm.createIndex('organizations', 'name');
  
  // Индекс для мягкого удаления
  pgm.createIndex('organizations', 'deleted_at');
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 */
export const down = (pgm) => {
  pgm.dropTable('organizations');
};
