var Twitter = require('twitter');
var config= require('./config.json');
var fs = require('fs');
var ecstatic = require('ecstatic')({ root: __dirname + '/public' });
var server = require('http').createServer( serverHandler );
var io = require('socket.io')(server);
var myPort = 3000;
var tweetFile = "/tweetStorage.json";
var allTweets = [];
var currentTwitStream;

var IN_DEVELOPMENT = true;

//var oldTweets;
var client;
try{
    var apiConfig = require( './config.json');
    twitEnv = {
        consumer_key: config.cKey,
        consumer_secret: config.cSecret,
        access_token_key: config.atKey,
        access_token_secret: config.atSecret
    };
}
catch( err ){
    console.log( 'Error getting apiConfig, try Heroku Env Vars: ' + err );
    // cannot find config.json so try for Heroku Env Vars instead
    twitEnv = {
      consumer_key: process.env.TWIT_C_KEY,
      consumer_secret: process.env.TWIT_C_SECRET,
      access_token_key: process.env.TWIT_AT_KEY,
      access_token_secret: process.env.TWIT_AT_SECRET,
    };

    console.log( 'ENV VAR CKEY: ' + twitEnv.consumer_key );
    console.log( 'ENV VAR CSecret: ' + twitEnv.consumer_secret );
    console.log( 'ENV VAR atKey: ' + twitEnv.access_token_key );
    console.log( 'ENV VAR atSecret: ' + twitEnv.access_token_secret );
};
// if Heroku Env Vars weren't set then client will be nothing
if( twitEnv.consumer_key === undefined ){
    console.log( 'Environment Vars Undefined');
}
else {
    client = new Twitter( twitEnv );
}

function serverHandler(request, response) {
  // SERVE INDEX.HTML, CSS AND JS for Browser Client ////
  ecstatic(request, response);
  if (currentTwitStream) currentTwitStream.destroy();
  
  // Connection received from Browser Client///////
  io.on('connection', function (socket) {
    console.log('client connected via socket');
    if (currentTwitStream) currentTwitStream.destroy();
//    // if there's data in filestream then send that back to the browser client first /////
    // fs.readFile(__dirname + tweetFile, "utf-8", function (err, data) {      
    //   var oldTweets = data;
    //   console.log(oldTweets);
    //   if( err ){
    //     console.log('oldTweets error: ', err );
    //   };
    //   //console.log(JSON.parse(data));
    //   if( oldTweets !== undefined && oldTweets.length !== 0 ){
    //     console.log('sending back old tweets');
    //     console.log(oldTweets);
    //     socket.emit( 'oldtweets', oldTweets);
    //   }
    // });
    // if( IN_DEVELOPMENT ) {
    //   var testTweets = getTestTweets();
    //   console.log( 'Number of test tweets: ' + testTweets.length);
    //   //for( i = 0 ; i< 10; i++ ){
    //     setTimeout( function(){
    //       console.log( 'Hello World');
    //     }, 10000);
    //   //}
    // }
    // Regardless of whether there's data in th filestream, call the API to stream in new tweets//////
    client.stream('statuses/filter', { track:'#stop, #go, #continue, #chocolate, #cheese, #candy'}, function (stream) {
      //if( err ) console.log( 'error sending api request: ' + err );
      currentTwitStream = stream;
      console.log( 'in stream callback - set currentTwitStream');
      // if( IN_DEVELOPMENT ){
      //   // whilst testing, use filestream of raw tweets instead of making api call
      //   fs.readFile(__dirname + tweetFile, "utf-8", function (err, data) {
      //     var json = JSON.parse( data );

      // }
      stream.on('data', function(tweet) {
            console.log('streaming data');

            
            socket.emit( 'tweet', tweet );

            fs.appendFile( './rawTweets.json', JSON.stringify(tweet, null, 4)+',', function(err) {
                 if(err) {
                     console.log('Error in rawtweets fs.appendFile: ', err);
                 };
            });
            // fs.appendFile( '.'+ tweetFile, JSON.stringify(fsObject, null, 4) +',', function(err) {
            //      if(err) {
            //          console.log('Error in fs.appendFile: ', err);
            //      } 
            //      else {
            //       console.log( 'FileStream: Added or Modified tweet in filestream');
            //       // console.log('emitting new tweets');
            //       // var newTweets = JSON.stringify(__dirname + "test.json");
            //       // socket.emit('tweet', newTweets);
            //       // console.log("The file was saved!");
            //      };
            // });
      });

      stream.on( 'end', function( response ) {
        console.log( 'STREAM ENDED!!! In twitter stream end, end the response stream');
        console.log( response );
      });
      stream.on('error', function(error) {
        console.log('stream on error: ', error);
        throw error;
      });
    });
  });
}

    
    // if( IN_DEVELOPMENT ){
    //   //   // whilst testing, use filestream of raw tweets instead of making api call
    //     fs.readFile(__dirname + '/rawTweets.json', "utf-8", function (err, data) {
    //        //var json = JSON.parse( data );
    //         if( err ) 
    //         console.log( 'Error: ' + err );
    //         var rawTweetsArray = data.split( ';');
    //         console.log( 'RawTweetsCount: ' + rawTweetsArray.length );
    //         for( i = 0; i< 5; i++ ){
    //           //setTimeout( function() {
    //             var rawTweet = rawTweetsArray[i];
    //             console.log( rawTweet );
    //             var hash = regexFormatter( rawTweet );
    //             var text = getOriginalTweetText( rawTweet );
    //             var originalTweetID = getOriginalTweetId( rawTweet );
    //             console.log( 'Orig Tweet Id: ' + originalTweetID );
    //             var retweetCount = getRetweetCount( rawTweet);

    //             var fsObject = { "origTweetID": originalTweetID, "text": text, "hashtag": hash, "retweetCount": retweetCount };
              
    //               console.log( 'Sending tweet: ' + fsObject.origTweetID );
    //               socket.emit( 'tweet', fsObject );
    //             //}, 20000);
    //          }; 

server.listen(myPort);


console.log('server up and running');

