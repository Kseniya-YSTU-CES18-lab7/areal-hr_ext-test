// api/test-direct.js
const { Client } = require('pg');

console.log('🔌 Пробую подключиться к БД...');

const client = new Client({
  // Один параметр вместо многих — надёжнее!
  connectionString: 'postgresql://postgres:159753@127.0.0.1:5434/hr_management_db?sslmode=disable',
});

client.connect()
  .then(() => {
    console.log('✅ Подключение успешно!');
    return client.query('SELECT NOW() as now');
  })
  .then(res => {
    console.log('🕐 Время на сервере БД:', res.rows[0].now);
    return client.end();
  })
  .catch(err => {
    console.error('❌ Ошибка подключения:', err.message);
    console.error('Код ошибки:', err.code);
    console.error('Детали:', err);
  });