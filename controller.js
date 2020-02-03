const model2 = require('./model2');

async function getAccount(accounts) {
	const accountId = Array.isArray(accounts) ? accounts : [accounts];
	return await model2.getAccount(accountId);
}

async function freezeAccount(account) {
	return model2.freezeAccount(account);
}

async function thawAccount(account) {
	return model2.thawAccount(account);
}

async function depositAccount(account, amount) {
	if(amount < 0) throw new Error('Can\'t deposit negative amount');
	return model2.depositAccount(account, amount);
}

async function withdrawAccount(account, amount) {
	if(amount < 0) throw new Error('Can\'t withdraw negative amount');
	return model2.withdrawAccount(account, amount);
}

async function xferAccount(accountFrom, accountTo, amount) {
	if(amount < 0) throw new Error('Can\'t transfer negative amount');
	if(accountFrom === accountTo) throw new Error('Can\'t do transaction on the same account');
	return model2.xferAccount(accountFrom, accountTo, amount);
}

exports.getAccount = getAccount;
exports.freezeAccount = freezeAccount;
exports.thawAccount = thawAccount;
exports.depositAccount = depositAccount;
exports.withdrawAccount = withdrawAccount;
exports.xferAccount = xferAccount;