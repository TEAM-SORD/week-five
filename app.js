var http = require('http');
var io = require('socket.io');
var Twitter = require('twitter');
var config= require('./config.json');
var fs = require('fs');

var client = new Twitter ({
	
	ConsumerKey: config.ConsumerKey,
	ConsumerSecret: config.ConsumerSecret,
	AccessToken: config.AccessToken,
	AccessTokenSecret: config.AccessTokenSecret
});

var ecstatic = require( 'ecstatic')({root: __dirname + '/public'});

var filePath;

module.exports = {
	start: function() {
		
		http.createServer(function (req, res) {

			client.stream('statuses/filter', {track: 'love'}, function(stream) {
	  			stream.on('data', function(tweet) {
	    		console.log(tweet.text);
	  			});
	  			stream.on('error', function(error) {
	    		throw error;
	  			});
			});   

		}).listen(3000);
	}
};