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

/**
 * Создание таблицы 'users' (пользователи)
 */
export const up = (pgm) => {
  pgm.createTable('users', {
    // Уникальный идентификатор пользователя (UUID)
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    
    // Фамилия (обязательное поле)
    surname: { type: 'varchar(100)', notNull: true },
    
    // Имя (обязательное поле)
    first_name: { type: 'varchar(100)', notNull: true },
    
    // Отчество (необязательное поле)
    patronymic: { type: 'varchar(100)' },
    
    // Логин для входа (уникальный, обязательный)
    login: { 
      type: 'varchar(100)', 
      notNull: true, 
      unique: true,
      comment: 'Уникальный логин для входа'
    },
    
    // Хеш пароля (Argon2id)
    password: { 
      type: 'varchar(255)', 
      notNull: true,
      comment: 'Хеш пароля (Argon2id)'
    },
    
    // Роль пользователя: admin (администратор) или manager (менеджер)
    role: { 
      type: 'varchar(20)', 
      notNull: true, 
      default: 'manager',
      check: "role IN ('admin', 'manager')",
      comment: 'Роль пользователя: admin или manager'
    },
    
    // Системные временные метки
    ...shorthands.timestamps,
  });
  
  // Индексы для ускорения поиска
  pgm.createIndex('users', 'login', { name: 'idx_users_login' });
  pgm.createIndex('users', 'role', { name: 'idx_users_role' });
  pgm.createIndex('users', 'deleted_at', { name: 'idx_users_deleted_at' });
  pgm.createIndex('users', 'surname', { name: 'idx_users_surname' });
};

/**
 * Откат миграции: удаление таблицы 'users'
 */
export const down = (pgm) => {
  pgm.dropTable('users');
};