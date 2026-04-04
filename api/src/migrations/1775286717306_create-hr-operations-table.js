/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */

// Создание таблицы "Кадровые операции"
export const up = (pgm) => {
  pgm.createTable('hr_operations', {
    // Первичный ключ
    id: { type: 'serial', primaryKey: true },
    // Внешний ключ для связи с сотрудником (один ко многим)
    employee_id: { 
      type: 'uuid', 
      notNull: true, 
      references: 'employees',
      onDelete: 'cascade' // При удалении сотрудника удаляются и все его кадровые операции
    },
    // Тип операции (ограничение через CHECK)
    operation_type: { 
      type: 'varchar(50)', 
      notNull: true,
      check: "operation_type IN ('hire', 'change_salary', 'change_department', 'dismissal')"
    },
    // Внешний ключ на отдел
    department_id: { 
      type: 'integer', 
      references: 'departments',
      onDelete: 'set null'
    },
    // Внешний ключ на должность
    position_id: { 
      type: 'integer', 
      references: 'positions',
      onDelete: 'set null'
    },
    // Новая зарплата
    salary: { type: 'numeric(15,2)' },
    // Дата операции
    operation_date: { type: 'date', notNull: true },
    created_at: { type: 'timestamp', default: 'now()', notNull: true },
    updated_at: { type: 'timestamp', default: 'now()', notNull: true },
    deleted_at: { type: 'timestamp', default: null },
  });

  pgm.createIndex('hr_operations', 'employee_id');
  pgm.createIndex('hr_operations', 'operation_type');
  pgm.createIndex('hr_operations', 'deleted_at');
};

export const down = (pgm) => {
  pgm.dropTable('hr_operations');
};
