/**
 * Cоздание таблицы employees (Сотрудники)
 */

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

export const up = (pgm) => {
  pgm.createTable('employees', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    surname: { type: 'varchar(100)', notNull: true },
    first_name: { type: 'varchar(100)', notNull: true },
    patronymic: { type: 'varchar(100)' },
    birth_date: { type: 'date' },
    ...shorthands.timestamps,
  });

  pgm.createIndex('employees', 'surname');
  pgm.createIndex('employees', 'deleted_at');
};

export const down = (pgm) => {
  pgm.dropTable('employees');
};