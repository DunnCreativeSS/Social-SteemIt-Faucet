var steem = require("steem");
var express = require('express');

var app = express()

var http = require("http");
setInterval(function() {
    http.get("http://steemit-faucet.herokuapp.com");
}, 300000); // every 5 minutes (300000)

app.listen(process.env.PORT || 8080, function() {});

var sbdPaid = 0;
var steemPaid = 0;
var vesting_shares, sbd, balance, delegated_vesting_shares, received_vesting_shares, total_vesting_shares , total_vesting_fund_steem=null;
var btcusd = 0;
var steemusd = 0;
var sbdusd = 0;
var vesting_shares, delegated_vesting_shares, received_vesting_shares, total_vesting_shares , total_vesting_fund_steem=null;
steem.api.getAccounts(["hodlorbust"], function(err, response){   
    vesting_shares= response["0"]. vesting_shares;
        delegated_vesting_shares= response["0"].delegated_vesting_shares;
    received_vesting_shares=response["0"].received_vesting_shares;
steem.api.getDynamicGlobalProperties(function(err, result) {
    total_vesting_shares=result.total_vesting_shares;
    total_vesting_fund=result.total_vesting_fund_steem;  
// Handle Promises, when you’re sure the two functions were completed simply do:
var steem_power= steem.formatter.vestToSteem(vesting_shares, total_vesting_shares, total_vesting_fund);
var delegated_steem_power= steem.formatter.vestToSteem((received_vesting_shares.split(' ')[0]-delegated_vesting_shares.split(' ')[0])+' VESTS', total_vesting_shares, total_vesting_fund);
console.log(steem_power,delegated_steem_power);
});
});
var delegators = {}
steem.api.getAccountHistory('hodlorbust', -1, 5000, function(err, result) {
	delegators = {}
           let transfers = result.filter( tx => tx[1].op[0] === 'delegate_vesting_shares' )

transfers.forEach((tx) => {
			let trxid = tx[1].trx_id
	if(tx[1].op[1].delegatee == 'hodlorbust'){
		if (delegators[tx[1].op[1].delegator] == undefined){
			delegators[tx[1].op[1].delegator] = 0;
		}
		delegators[tx[1].op[1].delegator] += parseFloat(steem.formatter.vestToSteem((tx[1].op[1].vesting_shares.split(' ')[0])+' VESTS', total_vesting_shares, total_vesting_fund));
		
	}

})
console.log(delegators);
})
var transfers2 = {}
var request = require('request');
request('https://bittrex.com/api/v2.0/pub/currencies/GetBTCPrice', function (error, response, body) {
    btcusd = JSON.parse(body)['result']['bpi']['USD']['rate_float'];


});
request('https://bittrex.com/api/v1.1/public/getmarketsummary?market=btc-steem', function (error, response, body) {
	steemusd = JSON.parse(body)['result'][0]['Last'] * btcusd;


});
request('https://bittrex.com/api/v1.1/public/getmarketsummary?market=btc-sbd', function (error, response, body) {
	sbdusd = JSON.parse(body)['result'][0]['Last'] * btcusd;


});
setInterval(function(){
	checkTx();
}, 60 * 1000 * 5);
function checkTx(){
	

steem.api.getAccountHistory('hodlorbust', -1, 5000, function(err, result) {
           let transfers = result.filter( tx => tx[1].op[0] === 'transfer' )
transfers2 = {}
transfers.forEach((tx) => {
			let trxid = tx[1].trx_id
	if(tx[1].op[1].to == 'hodlorbust'){
		if (transfers2[tx[1].op[1].from] == undefined){
			transfers2[tx[1].op[1].from] = {'sbd': 0, 'steem': 0, 'usd': 0};
		}
		console.log(tx[1].op[1].memo);
		if (tx[1].op[1].amount.slice(-3) == 'SBD'){
		transfers2[tx[1].op[1].from].sbd += parseFloat(tx[1].op[1].amount.substring(0, tx[1].op[1].amount.length-4));
		transfers2[tx[1].op[1].from].usd += parseFloat(tx[1].op[1].amount.substring(0, tx[1].op[1].amount.length-4)) * sbdusd;
		}
		else {
		transfers2[tx[1].op[1].from].steem += parseFloat(tx[1].op[1].amount.substring(0, tx[1].op[1].amount.length-6));
				transfers2[tx[1].op[1].from].usd += parseFloat(tx[1].op[1].amount.substring(0, tx[1].op[1].amount.length-6)) * steemusd;

		}
				transfers2[tx[1].op[1].from].memo = tx[1].op[1].memo;

	}


})		
console.log(transfers2);
})
}
setTimeout(function(){
	
checkTx();
}, 5000);
app.get('/', function(req, res) {
	var msg = "<br>You can advertise your Steem account by @ handle by sending SP delegation to @hodlorbust, or a specific ad (whatever you have in your memo when you send SBD or Steem to @hodlorbust)! The comment on their Faucet request will look like this: \'Sending you 0.40 SBD and 0.20 STEEM! Woot! Brought to you by: allaz! Promote your post. Your post will be min. 10 resteemed with over 13000 followers and min. 25 Upvote Different account (5000 STEEM POWER). Your post will be more popular and you will find new friends. Send 0.5 SBD or STEEM to @allaz ( URL as memo ) Service Active.! and a shoutout to minutely-pays for delegating some SP, too!\'<br><br>The faucet calculates a Math.random() number and compares it against the total USD value for contributions and the total SP value of all delegations then chooses a winner for that post. The more you contribute or delegate within the last recent blockchain memory, the higher chance you'll have of having your ad placed on a faucet requesters' comment!<br><br>Faucet requests for @hodlorbust last 24-hours: " + (reqs - 100);  
	for (var party in transfers2){
		msg+='<br><br>'+party+ ' USD value of SBD + Steem contributions: $' + transfers2[party].usd.toPrecision(3) + ' and their ad: ' + transfers2[party].memo;
	}
	msg+='<br><br><br><br>'
	for (var party in delegators){
		msg+='<br><br>'+party + ' SP delegated: ' + delegators[party].toPrecision(4);
	}
	res.send('<head>  <meta http-equiv="refresh" content="600"></head><body>SBD Balance: ' + sbd.toString() + '<br>STEEM Balance: ' + balance.toString() + '<br><br>SBD Paid: ' + sbdPaid.toString() + '<br>STEEM Paid: ' + steemPaid.toString() + '<br>'+ msg+ ' </body></html>');
	
	})
	
setInterval(function(){
balances();
}, 5000);
function balances(){
	steem.api.getAccounts(["hodlorbust"], function(err, response){  
	sbd =response["0"].sbd_balance;
	balance = response["0"].balance;
	

				balance = parseFloat(balance.substring(0, balance.length - 6));
				sbd = parseFloat(sbd.substring(0, sbd.length - 4));
	
});
}
balances();
var discussions = []
var perms = []
var repsids = []
setInterval(function(){
	
dodatthang();
	
}, 15 * 1000);



var sleep = require('system-sleep');
var ONE_DAY = 24* 60 * 60 * 1000; /* ms */
var wif = "5Jj8pyzebYBPe3rtD71f8fE44HLPgZ4oVNX8iwNKbGxSzwpdax6";
var timestamps = []
var authors = []
function dodatthang(){
	
	var oldestPermLink = ""
	steem.api.getDiscussionsByCreated({ "limit": 100}, function(err, result) { //getDiscussionsByCreated
		if (err === null) {
			var i, len = result.length;
			for (i = 0; i < len; i++) {
				var discussion = result[i];
				if (!perms.includes(discussion.permlink)){
				discussions.push(discussion);
				perms.push(discussion.permlink);
				}

			}
		} else {
			console.log(err);
		}
	console.log(discussions.length);
	
				console.log(balance);
				console.log(sbd);
	for (var i in discussions){
		if (discussions[i].author == 'hodlorbust'){
		console.log('hodlorbust');	
		}
		var author = discussions[i].author;
		var permlink = discussions[i].permlink;
		
		doAThing(author, permlink);
	
	}
	});
}
setTimeout(function(){
dodatthang();
}, 8000);
var authorsa = []
var validAuthors = []
var authorsInTs = [];
var reqs = 100
function doAThing(author, permlink){
	steem.api.getContentAsync(author, permlink)
	  .then(function(post) {
		steem.api.getContentRepliesAsync(author, permlink)
		  .then(function(replies) {
			  if (author == 'hodlorbust'){
			  }

			  for (var a in replies){
			  if (!repsids.includes(replies[a].id)){
				  repsids.push(replies[a].id);
				  
			var reps = replies[a].body.toString().toLowerCase();
			if (reps.length != 0){
				if (reps.indexOf('receive a payout from the @hodlorbust faucet') != -1){ //receive a payout from the @hodlorbust faucet
				  authorsa.push(replies[a].author);
				  timestamps.push(replies[a].created);
				  
				for (var aa in timestamps){
						if (new Date(timestamps[aa])- (new Date) > ONE_DAY){
							reqs--;
							console.log('reqs--');
						validAuthors = validAuthors.splice(authorsa[aa]);
						authors = authors.splice(authorsa[aa]);
						}	
					if ( new Date(timestamps[aa]) - (new Date)  < ONE_DAY && !validAuthors.includes(authorsa[aa])){
						reqs++;
						validAuthors.push(authorsa[aa]);
					}

				}
				console.log(reqs);
				var toSendSbd = (sbd / reqs);
				var toSendBalance = (balance / reqs);
				
				toSendSbd = ((toSendSbd).toString().substring(0, 5));
				toSendBalance = ((toSendBalance).toString().substring(0, 5));
				console.log(toSendSbd);
				console.log(toSendBalance);
				if (validAuthors.includes(replies[a].author)){
				if (!authors.includes(replies[a].author)){
						authors.push(replies[a].author);
						var apermlink = Math.random()
							.toString(36)
							.substring(2);
						sleep(3040)
									  var amemo = 'https://steemit-faucet.herokuapp.com/ Sending you ' +toSendSbd + ' SBD and ' + toSendBalance + ' STEEM! Woot! '
				amemo+='Brought to you by: '
				var usdTot = 0;
				for (var party in transfers2){
					usdTot += transfers2[party].usd;
				}
				var ran = Math.random() * usdTot;
				usdTot = 0;
				var done = false;
				for (var party in transfers2){
					usdTot += transfers2[party].usd;
					if (usdTot >= ran && done == false){
						done = true;
						amemo += party + '! ' + transfers2[party].memo
					}
				}
				var spTot = 0;
				for (var party in delegators){
					spTot += delegators[party];
				}
				console.log(spTot);
				ran = Math.random() * spTot;
				spTot = 0;
				done = false;
				for (var party in delegators){
					spTot += delegators[party];
						if (spTot >= ran && done == false){
						done = true;
						amemo += ' and a shoutout to ' + party + ' for delegating some SP, too!'
					}
				}				console.log(amemo);

						steem.broadcast.comment('5JSwxdnsPMgYYhkHN6rpGLtihZfwhz2LHnnZYKCYKkQsxr7EwTg', replies[a].author, replies[a].permlink, 'hodlorbust', apermlink, '', amemo, '', function(err, result) {
						  console.log(err, result);
						});

						if (parseFloat(toSendSbd) != 0){
							sbdPaid+=parseFloat(toSendSbd);
				steem.broadcast.transfer(wif, 'hodlorbust', replies[a].author, toSendSbd + ' SBD', 'Faucet payout!', function(err, result) {
					  console.log(err, result);
					});
						}
												if (parseFloat(toSendBalance) != 0){
						steemPaid += parseFloat(toSendBalance);
				steem.broadcast.transfer(wif, 'hodlorbust', replies[a].author, toSendBalance + ' STEEM', 'Faucet payout!', function(err, result) {
					  console.log(err, result);
					}); 
												}
				}
				
				}
				}
			}
			  }
			  }
		  });
	  });
}