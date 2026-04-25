/**
 * Migration: Изменение типа user_id в таблице history с uuid на varchar
 */
export const up = (pgm) => {
  // Меняем тип колонки user_id с uuid на varchar(100)
  pgm.alterColumn('history', 'user_id', {
    type: 'varchar(100)',
    using: 'user_id::varchar'
  });
};

export const down = (pgm) => {
  // Откат: можно вернуть uuid, но только если все значения — валидные UUID
  pgm.alterColumn('history', 'user_id', {
    type: 'uuid',
    using: 'user_id::uuid'
  });
};