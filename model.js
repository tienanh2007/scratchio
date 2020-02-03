const {Client} = require('pg');

const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'scratch',
  password: 'Dien1234',
  port: 5432,
});

client.connect();

client.query('CREATE TABLE IF NOT EXISTS Account(id SERIAL PRIMARY KEY, accountId VARCHAR(40) not null unique, balance REAL, frozen BOOLEAN)', (err, res) => {
	console.log(err);
	client.end();
});

