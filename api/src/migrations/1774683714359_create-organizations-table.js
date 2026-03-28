// Миграция для создания таблицы organizations (Организации)

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
  pgm.createTable('organizations', {
    id: { type: 'serial', primaryKey: true, comment: 'Уникальный идентификатор организации' },
    name: { type: 'varchar(255)', notNull: true, comment: 'Полное наименование организации' },
    comment: { type: 'text', nullable: true, comment: 'Произвольные заметки об организации' },
    ...shorthands.timestamps,
  });

  // Поиск по названию и фильтрация удалённых записей (для soft delete)
  pgm.createIndex('organizations', 'name', { name: 'idx_organizations_name' });
  pgm.createIndex('organizations', 'deleted_at', { name: 'idx_organizations_deleted_at' });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 */
export const down = (pgm) => {
  pgm.dropTable('organizations');
};
