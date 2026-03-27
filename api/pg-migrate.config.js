require('dotenv').config({ path: '../.env' });

module.exports = {
  databaseUrl: process.env.DB_URL,
  migrationsTable: 'migrations',
  migrationsDir: 'src/migrations',
  dir: 'src/migrations',
  checkOrder: true,
  verbose: true,
  ignorePattern: '.*\\.map\\.js',
};