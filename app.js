var http = require('http');
var io = require('socket.io');
var Twitter = require('twitter');
var config= require('./config.json');
var fs = require('fs');
var chocArray = [];
var cakeArray = [];
var cheeseArray = [];


	var client = new Twitter({
	consumer_key: config.ConsumerKey,
	consumer_secret: config.ConsumerSecret,
	access_token_key: config.AccessToken,
	access_token_secret: config.AccessTokenSecret
	});
	
    client.stream('statuses/filter', {track: 'chocolate, cake, cheese'}, function (stream) {
    stream.on('data', function(tweet) {
        if(tweet.text.search('chocolate') !== -1) {
            chocArray.push(tweet);
        } else if (tweet.text.search('cake') !== -1) {
            cakeArray.push(tweet);
        } else if (tweet.text.search('cheese') !== -1) {
            cheeseArray.push(tweet.text, tweet.retweeted);
            console.log(cheeseArray);
        }
    });
    stream.on('error', function(error) {
        console.log(error);
    });
});


 // function tweetmaker(tweet) {
 	
 // 		text: tweet.text,
 // 		screen_name: tweet.screen_name,
 // 		retweeted: tweet.retweeted,
 // 		retweet_count: tweet.retweet_count
 	
 	
 // }

 // console.log(tweetmaker(tweet));

// var ecstatic = require('ecstatic')({root: __dirname + '/public'});


//founderscoders #go, @founderscoders #stop, @founderscoders #continue














// module.exports = {
// 	start: function() {
		
// 		http.createServer(function (req, res) {

// 			client.stream('statuses/filter', {track: 'love'}, function(stream) {
// 	  			stream.on('data', function(tweet) {
// 	    		console.log(tweet.text);
// 	  			});
// 	  			stream.on('error', function(error) {
// 	    		throw error;
// 	  			});
// 			});   

// 		}).listen(3000);
// 	}
// };