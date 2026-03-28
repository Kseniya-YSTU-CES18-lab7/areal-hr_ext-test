const { Client } = require('pg');

console.log('🔌 Подключаюсь к postgres (default DB)...');

const client = new Client({
  connectionString: 'postgresql://postgres:159753@127.0.0.1:5434/postgres?sslmode=disable',
});

async function test() {
  try {
    await client.connect();
    console.log('✅ Подключился к postgres!');
    
    // Проверим, видит ли он hr_management_db
    const res = await client.query(`
      SELECT datname FROM pg_database 
      WHERE datname = 'hr_management_db'
    `);
    
    if (res.rows.length > 0) {
      console.log('✅ База hr_management_db ВИДНА серверу!');
    } else {
      console.log('❌ База hr_management_db НЕ видна серверу!');
    }
    
    await client.end();
  } catch (err) {
    console.error('❌ Ошибка:', err.message);
  }
}

test();