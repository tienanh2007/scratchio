const assert = require('assert');
const {Pool} = require('pg');
const sinon = require('sinon');
const chai = require('chai')
const chaiHttp = require('chai-http');

const model2 = require('./model2');
const controller = require('./controller');
const server = require('./server');

chai.use(chaiHttp);
const pool = new Pool({
  user: 'docker',
  host: 'localhost',
  database: 'scratch',
  password: 'docker',
  port: 5432,
});

describe('Model testing', function() {
	beforeEach(() => {
		pool.query('DELETE FROM ACCOUNT');
	});
	describe('createAccountIfNotExisted()', function() {
		it('should create account if not present', function() {
			const account = "ACT100";
			model2.createAccountIfNotExisted([account])
			.then(() => {
				return pool.query(`SELECT * FROM ACCOUNT WHERE accountId =\'${account}\'`)
			}).then(res => {
				assert.equal(res.rows[0].accountid, account);
				pool.query('DELETE FROM ACCOUNT');
			});
		});
		it('should not create account if present', function() {
			const account = "ACT100";
			pool.query(`INSERT INTO ACCOUNT (accountId, balance, frozen) VALUES (\'${account}\', 0.0, false)`)
			.then(() => {
				return model2.createAccountIfNotExisted([account]);
			}).then(() => {
				return pool.query(`SELECT * FROM ACCOUNT WHERE accountId =\'${account}\'`);
			}).then(res => {
				assert.equal(res.rows.length, 1);
				pool.query('DELETE FROM ACCOUNT');
			});
		});
	});
	
	describe('xferAccount()', function() {
		const frozenAccount = "frozen";
		const lowFundAccount = "lowFund";
		const goodAccount = "good";
		before(async () => {
			await pool.query('DELETE FROM ACCOUNT');
			await pool.query(`INSERT INTO ACCOUNT (accountId, balance, frozen) VALUES (\'${lowFundAccount}\', 1.0, false)`);
			await pool.query(`INSERT INTO ACCOUNT (accountId, balance, frozen) VALUES (\'${goodAccount}\', 100.0, false)`);
		});
		it('should not transfer if amount excess fund', async function() {
			try {
				await model2.xferAccount(lowFundAccount, goodAccount, 100)
			} catch(err) {
				assert.equal(err.message, 'Error: Account lowFund doesn\'t have sufficient fund');
			}
		});
		it('should tranfer from account to account', function() {
			model2.xferAccount(goodAccount, lowFundAccount, 10)
			.then(() => {
				return pool.query(`SELECT * FROM ACCOUNT WHERE accountId =\'${lowFundAccount}\'`);
			})
			.then(res => {
				assert.equal(res.row[0].balance, 11);
			});
		});		
	});
});

describe('Controller testing', function() {
	describe('xferAccount()', function() {
		it('should throw error if amount is negative', async function() {
			const accountFrom = "ACT100";
			const accountTo = "ACT101";
			const amount = -100;
			try {
				await controller.xferAccount(accountTo, accountFrom, amount);
			} catch(err) {
				assert.equal(err.message, 'Can\'t transfer negative amount');
			}
		});
		it('should throw error if accounts are the same', async function() {
			const accountFrom = "ACT100";
			const accountTo = "ACT100";
			const amount = 100;
			try {
				await controller.xferAccount(accountTo, accountFrom, amount);
			} catch(err) {
				assert.equal(err.message, 'Can\'t do transaction on the same account');
			}
		});
	});
});

describe('Route testing', function() {
	describe('/accounts', function() {
		const accountId = "ACT100";
		it('should return the correct accounts', async function() {
			chai.request(server).get(`/accounts?accountId=${accountId}`)
			.end((err, res) => {
				assert.equal(res.status, 200);
				console.log(JSON.stringify(res.body));
				assert.equal(res.body.data[0].accountid, accountId);
				assert.equal(res.body.data[0].balance, 0);
				assert.equal(res.body.data[0].frozen, false);
			});
		});
	});
});