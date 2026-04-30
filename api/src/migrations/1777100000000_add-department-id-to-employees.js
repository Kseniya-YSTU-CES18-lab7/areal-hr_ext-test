/**
 * Migration: Добавление связи сотрудника с отделом
 */

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 */
export const up = (pgm) => {
  // КОлонка department_id с внешним ключом на departments(id)
  pgm.addColumn('employees', {
    department_id: {
      type: 'integer',
      references: 'departments',
      onDelete: 'set null',  // при удалении отдела поле обнуляется, а не удаляет сотрудника
    },
  });
  
  // Индекс для ускорения поиска сотрудников по отделу
  pgm.createIndex('employees', 'department_id', { name: 'idx_employees_department_id' });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 */
export const down = (pgm) => {
  pgm.dropIndex('employees', 'department_id', { name: 'idx_employees_department_id' });
  pgm.dropColumn('employees', 'department_id');
};