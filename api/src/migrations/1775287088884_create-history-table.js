/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */

// Создание таблицы "История изменений"
export const up = (pgm) => {
  // Первичный ключ
  pgm.createTable('history', {
    id: { type: 'serial', primaryKey: true },
    // Внешний ключ для связи с пользователем (кто конкретно сделал изменение)
user_id: { 
  type: 'uuid', 
  notNull: true 
  // FK добавим позже, когда создадим таблицу users (план 5-6 неделя)
},
    // Тип изменённой сущности (полиморфная связь)
    entity_type: { 
      type: 'varchar(50)', 
      notNull: true,
      check: "entity_type IN ('Organization','Department','Position','Employee','HROperation')"
    },
    // ID изменённой записи (TEXT, потому что может быть как INTEGER, так и UUID)
    entity_id: { type: 'text', notNull: true },
    // Какое поле было изменено
    field_name: { type: 'varchar(100)', notNull: true },
    // Старое значение
    old_value: { type: 'text' },
    // Новое значение
    new_value: { type: 'text' },
    // Тип операции
    operation_type: { 
      type: 'varchar(20)', 
      notNull: true,
      check: "operation_type IN ('create','update','delete')"
    },
    created_at: { type: 'timestamp', default: 'now()', notNull: true },
    updated_at: { type: 'timestamp', default: 'now()', notNull: true },
  });

  // Полиморфный индекс для быстрых запросов
  pgm.createIndex('history', ['entity_type', 'entity_id'], { name: 'idx_history_entity' });
  pgm.createIndex('history', 'user_id');
  pgm.createIndex('history', 'created_at');
};

export const down = (pgm) => {
  pgm.dropTable('history');
};
