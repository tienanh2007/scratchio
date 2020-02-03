const express = require('express');
const bodyParser = require('body-parser');
const controller = require('./controller');

const app = express();
const port = 3000;

app.use(bodyParser.json());

app.get('/accounts', async (req, res) => {
	const accounts = await controller.getAccount(req.query.accountId)
	res.send({
		success: true,
		data: accounts
	});

});

app.post('/transactions', async (req, res) => {
	let failedTransactions = [];
	for(const action of req.body) {
		try {
			if(action.cmd === "FREEZE") {
				await controller.freezeAccount(action.accountId);
			} else if(action.cmd === "THAW") {
				await controller.thawAccount(action.accountId);
			} else if(action.cmd === "DEPOSIT") {
				await controller.depositAccount(action.accountId, action.amount);
			} else if(action.cmd === "WITHDRAW") {
				await controller.withdrawAccount(action.accountId, action.amount);
			} else if(action.cmd === "XFER") {
				await controller.xferAccount(action.fromId, action.toId, action.amount);
			}	 
		} catch(err) {
			console.log(err);
			failedTransactions.push(action);
		}
	};
	
	res.send(failedTransactions);
	
});


app.listen(port, () => console.log(`listening on ${port}`));

module.exports = app;