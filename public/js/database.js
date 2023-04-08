
const mariadb = require('mariadb');

const pool = mariadb.createPool({
  host: '127.0.0.1',
  user: 'root',
  password: '',
  database: 'datingapp'
});

pool.on('acquire', function (connection) {
  console.log('Connection %d acquired', connection.threadId);
});

pool.on('release', function (connection) {
  console.log('Connection %d released', connection.threadId);
});

pool.on('error', function (err) {
  console.error('Database error:', err);
  if (err.code === 'PROTOCOL_CONNECTION_LOST') {
    console.log('Reconnecting to database...');
    pool.getConnection(function (err, connection) {
      if (err) {
        console.error('Error connecting to database:', err);
      } else {
        console.log('Connected to database as id', connection.threadId);
        connection.release();
      }
    });
  } else {
    throw err;
  }
});

module.exports = pool;
