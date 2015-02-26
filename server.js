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
//var oldTweets;
var client = new Twitter({
    consumer_key: config.cKey,
    consumer_secret: config.cSecret,
    access_token_key: config.atKey,
    access_token_secret: config.atSecret
});
//console.log( )
function updateTweetInFS( fsObject){
        // pull in json file from FS
        // look for the tweet original id
        // update retweet count
        // output back to FS
}

function regexFormatter (tweet){
  var tweetText = tweet.text;
  var regex = /\S*#(?:[[^]]+]|\S+)/g;
  var formatter = regex.exec(tweetText);
  if( formatter === null || formatter.length === 0) {
    return '';
  };
  var hash = formatter[0].slice(1);
  console.log( 'hash: '+ hash);
  return hash;
};

function getOriginalTweetText( tweet ) {
  // if not a retweet
  if( tweet.retweeted_status === undefined ) {
    return tweet.text;
  }
  else { // if a retweet, get original tweet text
    return tweet.retweeted_status.text;
  };
};
function getRetweetCount( tweet ){
  if( tweet.retweeted_status === undefined ) {
    return 0;
  }
  else {
    return tweet.retweeted_status.retweet_count;
  };
};

function getOriginalTweetId(tweet){
  if( tweet.retweeted_status === undefined ) {
    return tweet.id;
  }
  else {
    return tweet.retweeted_status.id;
  };
};

function addOrUpdateTweetInFS( tweet, tweetObject ){
  // if new tweet then push into db
  //console.log( tweetObject );
  var updated = false;
  var origTweetID = tweetObject.origTweetID;
  console.log( 'OrigTweetID: ' + origTweetID);
  if( tweet.retweeted_status === undefined ) {
    console.log( 'New tweet so push to global array. ID: ' + origTweetID);
    allTweets.push( tweetObject );
  }
  else {
    allTweets.forEach( function( elem, i ) {
      if( elem.origTweetID === origTweetID ) {
        console.log( 'Update retweet count: index: ' + i );
        console.log( 'Retweet count went from: ' + elem.retweetCount + ' to: ' + tweetObject.retweetCount);
        allTweets[i] = tweetObject;
        updated = true;
      }
    });
    if( updated === true ) console.log( 'Updated retweet count');
    console.log( allTweets);
  };
};
function serverHandler(request, response) {
  // SERVE INDEX.HTML, CSS AND JS for Browser Client ////
  ecstatic(request, response);
  
  if (currentTwitStream) currentTwitStream.destroy();

  // Connection received from Browser Client///////
  io.on('connection', function (socket) {
    console.log('client connected via socket');

    // if there's data in filestream then send that back to the browser client first /////
    fs.readFile(__dirname + tweetFile, "utf-8", function (err, data) {      
      var oldTweets = data;
      console.log(oldTweets);
      if( err ){
        console.log('oldTweets error: ', err );
      };
      //console.log(JSON.parse(data));
      if( oldTweets !== undefined && oldTweets.length !== 0 ){
        console.log('sending back old tweets');
        console.log(oldTweets);
        socket.emit( 'oldtweets', oldTweets);
      }
    });
    // Regardless of whether there's data in th filestream, call the API to stream in new tweets//////
    client.stream('statuses/filter', { track:'javascript'}, function (stream) {
      //if( err ) console.log( 'error sending api request: ' + err );
      currentTwitStream = stream;
      console.log( 'in stream callback');
      // if( IN_DEVELOPMENT ){
      //   // whilst testing, use filestream of raw tweets instead of making api call
      //   fs.readFile(__dirname + tweetFile, "utf-8", function (err, data) {
      //     var json = JSON.parse( data );

      // }
      stream.on('data', function(tweet) {
            console.log('streaming data');

            var hash = regexFormatter( tweet );
            var text = getOriginalTweetText( tweet );
            var originalTweetID = getOriginalTweetId( tweet );
            console.log( 'Orig Tweet Id: ' + originalTweetID );
            var retweetCount = getRetweetCount(tweet);

            var fsObject = { "origTweetID": originalTweetID, "text": text, "hashtag": hash, "retweetCount": retweetCount };

            addOrUpdateTweetInFS( tweet, fsObject );
            socket.emit( 'tweet', fsObject );

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
      });
      stream.on('error', function(error) {
        console.log('stream on error: ', error);
        throw error;
      });
    });
  });
}

server.listen(myPort);
console.log('server up and running');

