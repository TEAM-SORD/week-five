var http = require('http');
var io = require('socket.io');
var Twitter = require('twitter');
var config= require('./config.json');
var fs = require('fs');

	var client = new Twitter({
	consumer_key: config.ConsumerKey,
	consumer_secret: config.ConsumerSecret,
	access_token_key: config.AccessToken,
	access_token_secret: config.AccessTokenSecret
	});
	

client.stream('statuses/filter', { track:'@founderscoders #go, @founderscoders #stop, @founderscoders #continue'}, function(stream) {
  stream.on('data', function(tweet) {
    console.log(tweet.text);
  });

  stream.on('error', function(error) {
    throw error;
  });
});

// var ecstatic = require('ecstatic')({root: __dirname + '/public'});


















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