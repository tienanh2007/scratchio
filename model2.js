const {Pool} = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'scratch',
  password: 'Dien1234',
  port: 5432,
});

async function getAccount(accounts) {
	await createAccountIfNotExisted(accounts);
	let res;
	// generate params list $1, $2, etc
	let params = accounts.map((account, index) => '$' + (index + 1));
	try {
		res = await pool.query(`SELECT * FROM ACCOUNT WHERE accountId IN (${params.join(',')})`, accounts);
	} catch(err) {
		console.log(err);
	}
	
	return res.rows;
}

async function freezeAccount(account) {
	await createAccountIfNotExisted([account]);
	let res;
	const client = await pool.connect();
	try {
		await client.query('BEGIN');
		
		res = await pool.query(`UPDATE ACCOUNT SET frozen = TRUE WHERE accountId = \'${account}\'`);
		
		await client.query('COMMIT');
	} catch(err) {
		client.query('ROLLBACK');
		console.log(err);
	} finally {
		client.release();
	}
}

async function thawAccount(account) {
	await createAccountIfNotExisted([account]);
	let res;
	const client = await pool.connect();
	try {
		await client.query('BEGIN');
		
		res = await pool.query(`UPDATE ACCOUNT SET frozen = FALSE WHERE accountId = \'${account}\'`);
		
		await client.query('COMMIT');
	} catch(err) {
		client.query('ROLLBACK');
		console.log(err);
	} finally {
		client.release();
	}
	
	return res;
}

async function depositAccount(account, amount) {
	await createAccountIfNotExisted([account]);
	let res;
	const client = await pool.connect();
	try {
		await client.query('BEGIN');
		
		res = await pool.query(`SELECT frozen from ACCOUNT WHERE accountId = \'${account}\'`);
		if(res.rows[0] && res.rows[0].frozen) throw new Error(`Error: Account ${account} is frozen`);
		
		res = await pool.query(`UPDATE ACCOUNT SET balance = balance + ${Number(amount)} WHERE accountId = \'${account}\'`);
		
		await client.query('COMMIT');
	} catch(err) {
		client.query('ROLLBACK');
		throw err;
	} finally {
		client.release();
	}
	
	return res;
}

async function withdrawAccount(account, amount) {
	await createAccountIfNotExisted([account]);
	let res;
	const client = await pool.connect();
	try {
		await client.query('BEGIN');
		
		res = await pool.query(`SELECT frozen from ACCOUNT WHERE accountId = \'${account}\'`);
		if(res.rows[0] && res.rows[0].frozen) throw new Error(`Error: Account ${account} is frozen`);
		
		res = await pool.query(`SELECT balance from ACCOUNT WHERE accountId = \'${account}\'`);
		if(res.rows[0] && res.rows[0].balance < amount) throw new Error(`Error: Account ${account} doesn\'t have sufficient fund`);
		
		res = await pool.query(`UPDATE ACCOUNT SET balance = balance - ${Number(amount)} WHERE accountId = \'${account}\'`);
		
		await client.query('COMMIT');
	} catch(err) {
		client.query('ROLLBACK');
		throw err;
	} finally {
		client.release();
	}
	
	return res;
}

async function xferAccount(accountFrom, accountTo, amount) {
	await createAccountIfNotExisted([accountFrom, accountTo]);
	let res;
	const client = await pool.connect();
	try {
		await client.query('BEGIN');
		
		res = await pool.query(`SELECT balance, frozen from ACCOUNT WHERE accountId = \'${accountFrom}\'`);
		if(res.rows[0] && res.rows[0].frozen) throw new Error(`Error: Account ${accountFrom} is frozen`);
		if(res.rows[0] && Number(res.rows[0].balance) < Number(amount)) throw new Error(`Error: Account ${accountFrom} doesn\'t have sufficient fund`);
		
		res = await pool.query(`SELECT frozen from ACCOUNT WHERE accountId = \'${accountTo}\'`);
		if(res.rows[0] && res.rows[0].frozen) throw new Error(`Error: Account ${accountTo} is frozen`);
		
		const queryFrom = `UPDATE ACCOUNT SET balance = balance - ${Number(amount)} WHERE accountId = \'${accountFrom}\'`;
		const queryTo = `UPDATE ACCOUNT SET balance = balance + ${Number(amount)} WHERE accountId = \'${accountTo}\'`;
		
		res = await pool.query(queryFrom);
		res = await pool.query(queryTo);
		
		await client.query('COMMIT');
	} catch(err) {
		client.query('ROLLBACK');
		throw err;
	} finally {
		client.release();
	}
	return res;
}

async function createAccountIfNotExisted(accounts) {
	let res;
	const client = await pool.connect();
	try {
		await client.query('BEGIN');
		for(const acc of accounts) {
			res = await pool.query(`SELECT EXISTS(SELECT 1 FROM ACCOUNT WHERE accountId = \'${acc}\')`);
			if(res.rows[0] && !res.rows[0].exists) {
				res = await pool.query(`INSERT INTO ACCOUNT (accountId, balance, frozen) VALUES (\'${acc}\', 0.0, false)`);
			}		
		}
		await client.query('COMMIT');
	} catch(err) {
		client.query('ROLLBACK');
		throw err;
	} finally {
		client.release();
	}
	
}

exports.getAccount = getAccount;
exports.freezeAccount = freezeAccount;
exports.thawAccount = thawAccount;
exports.depositAccount = depositAccount;
exports.withdrawAccount = withdrawAccount;
exports.xferAccount = xferAccount;
exports.createAccountIfNotExisted = createAccountIfNotExisted;

