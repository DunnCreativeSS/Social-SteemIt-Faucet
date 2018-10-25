var steem = require("steem");
var express = require('express');

var app = express()

var http = require("http");
setInterval(function() {
    http.get("http://steemit-faucet.herokuapp.com");
}, 300000); // every 5 minutes (300000)

app.listen(process.env.PORT || 8080, function() {});


app.get('/', function(req, res) {
	res.send('<head>  <meta http-equiv="refresh" content="600"></head><body>SBD: ' + sbd.toString() + '<br>STEEM: ' + balance.toString() + ' </body></html>');
});

var vesting_shares, sbd, balance, delegated_vesting_shares, received_vesting_shares, total_vesting_shares , total_vesting_fund_steem=null;
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
dodatthang();
var authorsa = []
var validAuthors = []
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
				  authors = []
				var reqs = 0;
				validAuthors = []
				for (var a in timestamps){
					if ((new Date) - new Date(timestamps[a]) < ONE_DAY){
						reqs++;
						validAuthors.push(authorsa[a]);
					}					
				}
				reqs += 100;
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
						if (parseFloat(toSendSbd) != 0){
				steem.broadcast.transfer(wif, 'hodlorbust', replies[a].author, toSendSbd + ' SBD', 'Faucet payout!', function(err, result) {
					  console.log(err, result);
					});
						}
												if (parseFloat(toSendBalance) != 0){

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