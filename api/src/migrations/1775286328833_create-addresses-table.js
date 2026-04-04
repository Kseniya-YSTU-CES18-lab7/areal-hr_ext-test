/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */

// Создание таблицы "Адреса регистрации"
export const up = (pgm) => {
  pgm.createTable('addresses', {
    id: { type: 'serial', primaryKey: true },
    // Внешний ключ для связи с сотрудником (1:1)
    employee_id: { 
      type: 'uuid', 
      notNull: true, 
      unique: true,  // 1:1 связь, т.к у одного сотрудника может быть только один адрес регистрации
      references: 'employees',
      onDelete: 'cascade' // Адрес удаляется вместе с сотрудником
    },
    region: { type: 'varchar(100)' },
    locality: { type: 'varchar(100)' },
    street: { type: 'varchar(100)' },
    house: { type: 'varchar(20)' },
    building: { type: 'varchar(20)' },
    apartment: { type: 'varchar(20)' },
    created_at: { type: 'timestamp', default: 'now()', notNull: true },
    updated_at: { type: 'timestamp', default: 'now()', notNull: true },
    deleted_at: { type: 'timestamp', default: null },
  });

  pgm.createIndex('addresses', 'employee_id');
  pgm.createIndex('addresses', 'deleted_at');
};

export const down = (pgm) => {
  pgm.dropTable('addresses');
};
