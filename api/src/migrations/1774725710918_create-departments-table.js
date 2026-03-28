/**
 * Миграция. Создание таблицы "Отделы" (Departments) (реализует вложенную структуру отделов внутри организаций)
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
  pgm.createTable('departments', {
    id: { type: 'serial', primaryKey: true, comment: 'Уникальный идентификатор отдела' },
    
    organization_id: { 
      type: 'integer', 
      notNull: true, 
      references: 'organizations',
      onDelete: 'cascade',
      comment: 'Ссылка на организацию (ON DELETE CASCADE)'
    },
    
    parent_id: { 
      type: 'integer', 
      references: 'departments',
      onDelete: 'set null',
      comment: 'Ссылка на родительский отдел (самосвязь, ON DELETE SET NULL)'
    },
    
    name: { type: 'varchar(255)', notNull: true, comment: 'Название отдела' },
    comment: { type: 'text', nullable: true, comment: 'Произвольные заметки об отделе' },
    
    ...shorthands.timestamps,
  });

  // Индексы для оптимизации запросов
  pgm.createIndex('departments', 'organization_id', { name: 'idx_departments_organization_id' });
  pgm.createIndex('departments', 'parent_id', { name: 'idx_departments_parent_id' });
  pgm.createIndex('departments', 'name', { name: 'idx_departments_name' });
  pgm.createIndex('departments', 'deleted_at', { name: 'idx_departments_deleted_at' });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 */
export const down = (pgm) => {
  pgm.dropTable('departments');
};