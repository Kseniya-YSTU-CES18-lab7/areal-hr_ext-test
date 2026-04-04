/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */

// Хранение паспортных данных сотрудника (связь 1:1)    
export const up = (pgm) => {
  pgm.createTable('passports', {
    id: { type: 'serial', primaryKey: true },
    employee_id: { 
      type: 'uuid', 
      notNull: true, 
      unique: true,  // 1:1 связь, т.к у одного сотрудника не может быть двух паспортов
      references: 'employees',
      onDelete: 'cascade' // Паспортные данные не могут существовать без сотрудника
    },
    series: { type: 'varchar(10)', notNull: true },
    number: { type: 'varchar(10)', notNull: true },
    issue_date: { type: 'date' },
    department_code: { type: 'varchar(10)' },
    issued_by: { type: 'varchar(255)' },
    created_at: { type: 'timestamp', default: 'now()', notNull: true },
    updated_at: { type: 'timestamp', default: 'now()', notNull: true },
    deleted_at: { type: 'timestamp', default: null },
  });

  pgm.createIndex('passports', 'employee_id');
  pgm.createIndex('passports', 'deleted_at');
};

export const down = (pgm) => {
  pgm.dropTable('passports');
};
