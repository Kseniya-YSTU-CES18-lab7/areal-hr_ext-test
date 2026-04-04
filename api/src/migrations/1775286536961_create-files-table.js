/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */

// Создание таблицы "Файлы"
export const up = (pgm) => {
  pgm.createTable('files', {
    // Первичный ключ
    id: { type: 'serial', primaryKey: true },
    // Внешний ключ для связи с сотрудником (один ко многим)
    employee_id: { 
      type: 'uuid', 
      notNull: true, 
      references: 'employees',
      onDelete: 'cascade'  // файл удаляется при удалении сотрудника
    },
    title: { type: 'varchar(255)', notNull: true },
    file_path: { type: 'varchar(500)', notNull: true },
    mime_type: { type: 'varchar(100)' },
    size_bytes: { type: 'bigint' },
    created_at: { type: 'timestamp', default: 'now()', notNull: true },
    deleted_at: { type: 'timestamp', default: null },
  });

  pgm.createIndex('files', 'employee_id');
  pgm.createIndex('files', 'deleted_at');
};

export const down = (pgm) => {
  pgm.dropTable('files');
};
