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
var client = new Twitter({
    consumer_key: config.cKey,
    consumer_secret: config.cSecret,
    access_token_key: config.atKey,
    access_token_secret: config.atSecret
});

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

function getTestTweets(){
  return [{
    "created_at": "Thu Feb 26 13:59:54 +0000 2015",
    "id": 570946358418538500,
    "id_str": "570946358418538496",
    "text": "Loop through array in #JavaScript - http://t.co/MWyYWRC9xs",
    "source": "<a href=\"http://stackoverflow.com/questions/tagged/javascript\" rel=\"nofollow\">BestJavaScript</a>",
    "truncated": false,
    "in_reply_to_status_id": null,
    "in_reply_to_status_id_str": null,
    "in_reply_to_user_id": null,
    "in_reply_to_user_id_str": null,
    "in_reply_to_screen_name": null,
    "user": {
        "id": 1540449835,
        "id_str": "1540449835",
        "name": "ThinkJavaScript",
        "screen_name": "ThinkJavaScript",
        "location": "",
        "url": null,
        "description": "Daily JavaScript tweets. Published and curated by @baeldung. Follow it now. Unless you don't want to.",
        "protected": false,
        "verified": false,
        "followers_count": 1273,
        "friends_count": 111,
        "listed_count": 94,
        "favourites_count": 3,
        "statuses_count": 2332,
        "created_at": "Sun Jun 23 08:08:37 +0000 2013",
        "utc_offset": 10800,
        "time_zone": "Baghdad",
        "geo_enabled": false,
        "lang": "en",
        "contributors_enabled": false,
        "is_translator": false,
        "profile_background_color": "C0DEED",
        "profile_background_image_url": "http://abs.twimg.com/images/themes/theme1/bg.png",
        "profile_background_image_url_https": "https://abs.twimg.com/images/themes/theme1/bg.png",
        "profile_background_tile": false,
        "profile_link_color": "0084B4",
        "profile_sidebar_border_color": "C0DEED",
        "profile_sidebar_fill_color": "DDEEF6",
        "profile_text_color": "333333",
        "profile_use_background_image": true,
        "profile_image_url": "http://pbs.twimg.com/profile_images/535393480575422464/x-5AXGlc_normal.png",
        "profile_image_url_https": "https://pbs.twimg.com/profile_images/535393480575422464/x-5AXGlc_normal.png",
        "default_profile": true,
        "default_profile_image": false,
        "following": null,
        "follow_request_sent": null,
        "notifications": null
    },
    "geo": null,
    "coordinates": null,
    "place": null,
    "contributors": null,
    "retweet_count": 0,
    "favorite_count": 0,
    "entities": {
        "hashtags": [
            {
                "text": "JavaScript",
                "indices": [
                    22,
                    33
                ]
            }
        ],
        "trends": [],
        "urls": [
            {
                "url": "http://t.co/MWyYWRC9xs",
                "expanded_url": "http://bit.ly/1gNvcsS",
                "display_url": "bit.ly/1gNvcsS",
                "indices": [
                    36,
                    58
                ]
            }
        ],
        "user_mentions": [],
        "symbols": []
    },
    "favorited": false,
    "retweeted": false,
    "possibly_sensitive": false,
    "filter_level": "low",
    "lang": "en",
    "timestamp_ms": "1424959194174"
},{
    "created_at": "Thu Feb 26 13:59:54 +0000 2015",
    "id": 570946358418538500,
    "id_str": "570946358418538496",
    "text": "Loop through array in #JavaScript - http://t.co/MWyYWRC9xs",
    "source": "<a href=\"http://stackoverflow.com/questions/tagged/javascript\" rel=\"nofollow\">BestJavaScript</a>",
    "truncated": false,
    "in_reply_to_status_id": null,
    "in_reply_to_status_id_str": null,
    "in_reply_to_user_id": null,
    "in_reply_to_user_id_str": null,
    "in_reply_to_screen_name": null,
    "user": {
        "id": 1540449835,
        "id_str": "1540449835",
        "name": "ThinkJavaScript",
        "screen_name": "ThinkJavaScript",
        "location": "",
        "url": null,
        "description": "Daily JavaScript tweets. Published and curated by @baeldung. Follow it now. Unless you don't want to.",
        "protected": false,
        "verified": false,
        "followers_count": 1273,
        "friends_count": 111,
        "listed_count": 94,
        "favourites_count": 3,
        "statuses_count": 2332,
        "created_at": "Sun Jun 23 08:08:37 +0000 2013",
        "utc_offset": 10800,
        "time_zone": "Baghdad",
        "geo_enabled": false,
        "lang": "en",
        "contributors_enabled": false,
        "is_translator": false,
        "profile_background_color": "C0DEED",
        "profile_background_image_url": "http://abs.twimg.com/images/themes/theme1/bg.png",
        "profile_background_image_url_https": "https://abs.twimg.com/images/themes/theme1/bg.png",
        "profile_background_tile": false,
        "profile_link_color": "0084B4",
        "profile_sidebar_border_color": "C0DEED",
        "profile_sidebar_fill_color": "DDEEF6",
        "profile_text_color": "333333",
        "profile_use_background_image": true,
        "profile_image_url": "http://pbs.twimg.com/profile_images/535393480575422464/x-5AXGlc_normal.png",
        "profile_image_url_https": "https://pbs.twimg.com/profile_images/535393480575422464/x-5AXGlc_normal.png",
        "default_profile": true,
        "default_profile_image": false,
        "following": null,
        "follow_request_sent": null,
        "notifications": null
    },
    "geo": null,
    "coordinates": null,
    "place": null,
    "contributors": null,
    "retweet_count": 0,
    "favorite_count": 0,
    "entities": {
        "hashtags": [
            {
                "text": "JavaScript",
                "indices": [
                    22,
                    33
                ]
            }
        ],
        "trends": [],
        "urls": [
            {
                "url": "http://t.co/MWyYWRC9xs",
                "expanded_url": "http://bit.ly/1gNvcsS",
                "display_url": "bit.ly/1gNvcsS",
                "indices": [
                    36,
                    58
                ]
            }
        ],
        "user_mentions": [],
        "symbols": []
    },
    "favorited": false,
    "retweeted": false,
    "possibly_sensitive": false,
    "filter_level": "low",
    "lang": "en",
    "timestamp_ms": "1424959194174"
},{
    "created_at": "Thu Feb 26 14:00:05 +0000 2015",
    "id": 570946404664905700,
    "id_str": "570946404664905728",
    "text": "If you're interested to sponsor the hottest #JavaScript conference this year, send a mail to hola@mediterraneajs.eu to get our brochure.",
    "source": "<a href=\"http://bufferapp.com\" rel=\"nofollow\">Buffer</a>",
    "truncated": false,
    "in_reply_to_status_id": null,
    "in_reply_to_status_id_str": null,
    "in_reply_to_user_id": null,
    "in_reply_to_user_id_str": null,
    "in_reply_to_screen_name": null,
    "user": {
        "id": 2656876490,
        "id_str": "2656876490",
        "name": "MediterráneaJS",
        "screen_name": "MediterraneaJS",
        "location": "Barcelona",
        "url": "http://MediterraneaJS.eu",
        "description": "22+23 June 2015",
        "protected": false,
        "verified": false,
        "followers_count": 85,
        "friends_count": 9,
        "listed_count": 6,
        "favourites_count": 8,
        "statuses_count": 48,
        "created_at": "Fri Jul 18 14:41:42 +0000 2014",
        "utc_offset": null,
        "time_zone": null,
        "geo_enabled": false,
        "lang": "en",
        "contributors_enabled": false,
        "is_translator": false,
        "profile_background_color": "000000",
        "profile_background_image_url": "http://abs.twimg.com/images/themes/theme1/bg.png",
        "profile_background_image_url_https": "https://abs.twimg.com/images/themes/theme1/bg.png",
        "profile_background_tile": false,
        "profile_link_color": "3B94D9",
        "profile_sidebar_border_color": "000000",
        "profile_sidebar_fill_color": "000000",
        "profile_text_color": "000000",
        "profile_use_background_image": false,
        "profile_image_url": "http://pbs.twimg.com/profile_images/522311296750866433/24MhWqxu_normal.png",
        "profile_image_url_https": "https://pbs.twimg.com/profile_images/522311296750866433/24MhWqxu_normal.png",
        "profile_banner_url": "https://pbs.twimg.com/profile_banners/2656876490/1413314357",
        "default_profile": false,
        "default_profile_image": false,
        "following": null,
        "follow_request_sent": null,
        "notifications": null
    },
    "geo": null,
    "coordinates": null,
    "place": null,
    "contributors": null,
    "retweet_count": 0,
    "favorite_count": 0,
    "entities": {
        "hashtags": [
            {
                "text": "JavaScript",
                "indices": [
                    44,
                    55
                ]
            }
        ],
        "trends": [],
        "urls": [],
        "user_mentions": [],
        "symbols": []
    },
    "favorited": false,
    "retweeted": false,
    "possibly_sensitive": false,
    "filter_level": "low",
    "lang": "en",
    "timestamp_ms": "1424959205200"
},{
    "created_at": "Thu Feb 26 14:00:05 +0000 2015",
    "id": 570946404664905700,
    "id_str": "570946404664905728",
    "text": "If you're interested to sponsor the hottest #JavaScript conference this year, send a mail to hola@mediterraneajs.eu to get our brochure.",
    "source": "<a href=\"http://bufferapp.com\" rel=\"nofollow\">Buffer</a>",
    "truncated": false,
    "in_reply_to_status_id": null,
    "in_reply_to_status_id_str": null,
    "in_reply_to_user_id": null,
    "in_reply_to_user_id_str": null,
    "in_reply_to_screen_name": null,
    "user": {
        "id": 2656876490,
        "id_str": "2656876490",
        "name": "MediterráneaJS",
        "screen_name": "MediterraneaJS",
        "location": "Barcelona",
        "url": "http://MediterraneaJS.eu",
        "description": "22+23 June 2015",
        "protected": false,
        "verified": false,
        "followers_count": 85,
        "friends_count": 9,
        "listed_count": 6,
        "favourites_count": 8,
        "statuses_count": 48,
        "created_at": "Fri Jul 18 14:41:42 +0000 2014",
        "utc_offset": null,
        "time_zone": null,
        "geo_enabled": false,
        "lang": "en",
        "contributors_enabled": false,
        "is_translator": false,
        "profile_background_color": "000000",
        "profile_background_image_url": "http://abs.twimg.com/images/themes/theme1/bg.png",
        "profile_background_image_url_https": "https://abs.twimg.com/images/themes/theme1/bg.png",
        "profile_background_tile": false,
        "profile_link_color": "3B94D9",
        "profile_sidebar_border_color": "000000",
        "profile_sidebar_fill_color": "000000",
        "profile_text_color": "000000",
        "profile_use_background_image": false,
        "profile_image_url": "http://pbs.twimg.com/profile_images/522311296750866433/24MhWqxu_normal.png",
        "profile_image_url_https": "https://pbs.twimg.com/profile_images/522311296750866433/24MhWqxu_normal.png",
        "profile_banner_url": "https://pbs.twimg.com/profile_banners/2656876490/1413314357",
        "default_profile": false,
        "default_profile_image": false,
        "following": null,
        "follow_request_sent": null,
        "notifications": null
    },
    "geo": null,
    "coordinates": null,
    "place": null,
    "contributors": null,
    "retweet_count": 0,
    "favorite_count": 0,
    "entities": {
        "hashtags": [
            {
                "text": "JavaScript",
                "indices": [
                    44,
                    55
                ]
            }
        ],
        "trends": [],
        "urls": [],
        "user_mentions": [],
        "symbols": []
    },
    "favorited": false,
    "retweeted": false,
    "possibly_sensitive": false,
    "filter_level": "low",
    "lang": "en",
    "timestamp_ms": "1424959205200"
},{
    "created_at": "Thu Feb 26 14:00:08 +0000 2015",
    "id": 570946418527113200,
    "id_str": "570946418527113216",
    "text": "RT @jquery_rain: jQuery Bootstrap Submenu http://t.co/x4nt3VAaQz #javascript #jquery",
    "source": "<a href=\"http://ttibensky.eu\" rel=\"nofollow\">ttibensky</a>",
    "truncated": false,
    "in_reply_to_status_id": null,
    "in_reply_to_status_id_str": null,
    "in_reply_to_user_id": null,
    "in_reply_to_user_id_str": null,
    "in_reply_to_screen_name": null,
    "user": {
        "id": 2732221518,
        "id_str": "2732221518",
        "name": "DevLikeAPro",
        "screen_name": "DevLikeAPro",
        "location": "",
        "url": "https://www.linkedin.com/in/tomastibensky",
        "description": "tweeting about web development, linux and technologies",
        "protected": false,
        "verified": false,
        "followers_count": 1160,
        "friends_count": 1789,
        "listed_count": 140,
        "favourites_count": 2,
        "statuses_count": 6207,
        "created_at": "Thu Aug 14 17:05:44 +0000 2014",
        "utc_offset": 3600,
        "time_zone": "Bratislava",
        "geo_enabled": false,
        "lang": "en",
        "contributors_enabled": false,
        "is_translator": false,
        "profile_background_color": "1A1B1F",
        "profile_background_image_url": "http://abs.twimg.com/images/themes/theme9/bg.gif",
        "profile_background_image_url_https": "https://abs.twimg.com/images/themes/theme9/bg.gif",
        "profile_background_tile": false,
        "profile_link_color": "13BA00",
        "profile_sidebar_border_color": "FFFFFF",
        "profile_sidebar_fill_color": "DDEEF6",
        "profile_text_color": "333333",
        "profile_use_background_image": true,
        "profile_image_url": "http://pbs.twimg.com/profile_images/500388956324655105/-SIvImDX_normal.jpeg",
        "profile_image_url_https": "https://pbs.twimg.com/profile_images/500388956324655105/-SIvImDX_normal.jpeg",
        "profile_banner_url": "https://pbs.twimg.com/profile_banners/2732221518/1408137241",
        "default_profile": false,
        "default_profile_image": false,
        "following": null,
        "follow_request_sent": null,
        "notifications": null
    },
    "geo": null,
    "coordinates": null,
    "place": null,
    "contributors": null,
    "retweeted_status": {
        "created_at": "Thu Feb 26 12:42:50 +0000 2015",
        "id": 570926965747687400,
        "id_str": "570926965747687425",
        "text": "jQuery Bootstrap Submenu http://t.co/x4nt3VAaQz #javascript #jquery",
        "source": "<a href=\"http://twitter.com\" rel=\"nofollow\">Twitter Web Client</a>",
        "truncated": false,
        "in_reply_to_status_id": null,
        "in_reply_to_status_id_str": null,
        "in_reply_to_user_id": null,
        "in_reply_to_user_id_str": null,
        "in_reply_to_screen_name": null,
        "user": {
            "id": 451429617,
            "id_str": "451429617",
            "name": "jQuery Rain",
            "screen_name": "jquery_rain",
            "location": "",
            "url": "http://www.jqueryrain.com",
            "description": "3500+ Ultimate Collection of jQuery Plugins,Html5 CSS3  JavaScript Tutorials with Demos #jquery #html5 #css3 #javascript #TeamFollowBack",
            "protected": false,
            "verified": false,
            "followers_count": 121435,
            "friends_count": 104350,
            "listed_count": 1012,
            "favourites_count": 3,
            "statuses_count": 4413,
            "created_at": "Sat Dec 31 12:46:11 +0000 2011",
            "utc_offset": 19800,
            "time_zone": "New Delhi",
            "geo_enabled": false,
            "lang": "en",
            "contributors_enabled": false,
            "is_translator": false,
            "profile_background_color": "FFFFFF",
            "profile_background_image_url": "http://pbs.twimg.com/profile_background_images/611972917/9bh757b8m4lihf24uhuq.png",
            "profile_background_image_url_https": "https://pbs.twimg.com/profile_background_images/611972917/9bh757b8m4lihf24uhuq.png",
            "profile_background_tile": true,
            "profile_link_color": "DC005A",
            "profile_sidebar_border_color": "C0DEED",
            "profile_sidebar_fill_color": "DDEEF6",
            "profile_text_color": "333333",
            "profile_use_background_image": true,
            "profile_image_url": "http://pbs.twimg.com/profile_images/2424733190/9h4dkhjwzqyq0vhck4nk_normal.png",
            "profile_image_url_https": "https://pbs.twimg.com/profile_images/2424733190/9h4dkhjwzqyq0vhck4nk_normal.png",
            "profile_banner_url": "https://pbs.twimg.com/profile_banners/451429617/1401793444",
            "default_profile": false,
            "default_profile_image": false,
            "following": null,
            "follow_request_sent": null,
            "notifications": null
        },
        "geo": null,
        "coordinates": null,
        "place": null,
        "contributors": null,
        "retweet_count": 9,
        "favorite_count": 10,
        "entities": {
            "hashtags": [
                {
                    "text": "javascript",
                    "indices": [
                        48,
                        59
                    ]
                },
                {
                    "text": "jquery",
                    "indices": [
                        60,
                        67
                    ]
                }
            ],
            "trends": [],
            "urls": [
                {
                    "url": "http://t.co/x4nt3VAaQz",
                    "expanded_url": "http://goo.gl/YRXznT",
                    "display_url": "goo.gl/YRXznT",
                    "indices": [
                        25,
                        47
                    ]
                }
            ],
            "user_mentions": [],
            "symbols": []
        },
        "favorited": false,
        "retweeted": false,
        "possibly_sensitive": false,
        "filter_level": "low",
        "lang": "en"
    },
    "retweet_count": 0,
    "favorite_count": 0,
    "entities": {
        "hashtags": [
            {
                "text": "javascript",
                "indices": [
                    83,
                    84
                ]
            },
            {
                "text": "jquery",
                "indices": [
                    83,
                    84
                ]
            }
        ],
        "trends": [],
        "urls": [
            {
                "url": "http://t.co/x4nt3VAaQz",
                "expanded_url": "http://goo.gl/YRXznT",
                "display_url": "goo.gl/YRXznT",
                "indices": [
                    83,
                    84
                ]
            }
        ],
        "user_mentions": [
            {
                "screen_name": "jquery_rain",
                "name": "jQuery Rain",
                "id": 451429617,
                "id_str": "451429617",
                "indices": [
                    3,
                    15
                ]
            }
        ],
        "symbols": []
    },
    "favorited": false,
    "retweeted": false,
    "possibly_sensitive": false,
    "filter_level": "low",
    "lang": "en",
    "timestamp_ms": "1424959208505"
},{
    "created_at": "Thu Feb 26 14:00:08 +0000 2015",
    "id": 570946418527113200,
    "id_str": "570946418527113216",
    "text": "RT @jquery_rain: jQuery Bootstrap Submenu http://t.co/x4nt3VAaQz #javascript #jquery",
    "source": "<a href=\"http://ttibensky.eu\" rel=\"nofollow\">ttibensky</a>",
    "truncated": false,
    "in_reply_to_status_id": null,
    "in_reply_to_status_id_str": null,
    "in_reply_to_user_id": null,
    "in_reply_to_user_id_str": null,
    "in_reply_to_screen_name": null,
    "user": {
        "id": 2732221518,
        "id_str": "2732221518",
        "name": "DevLikeAPro",
        "screen_name": "DevLikeAPro",
        "location": "",
        "url": "https://www.linkedin.com/in/tomastibensky",
        "description": "tweeting about web development, linux and technologies",
        "protected": false,
        "verified": false,
        "followers_count": 1160,
        "friends_count": 1789,
        "listed_count": 140,
        "favourites_count": 2,
        "statuses_count": 6207,
        "created_at": "Thu Aug 14 17:05:44 +0000 2014",
        "utc_offset": 3600,
        "time_zone": "Bratislava",
        "geo_enabled": false,
        "lang": "en",
        "contributors_enabled": false,
        "is_translator": false,
        "profile_background_color": "1A1B1F",
        "profile_background_image_url": "http://abs.twimg.com/images/themes/theme9/bg.gif",
        "profile_background_image_url_https": "https://abs.twimg.com/images/themes/theme9/bg.gif",
        "profile_background_tile": false,
        "profile_link_color": "13BA00",
        "profile_sidebar_border_color": "FFFFFF",
        "profile_sidebar_fill_color": "DDEEF6",
        "profile_text_color": "333333",
        "profile_use_background_image": true,
        "profile_image_url": "http://pbs.twimg.com/profile_images/500388956324655105/-SIvImDX_normal.jpeg",
        "profile_image_url_https": "https://pbs.twimg.com/profile_images/500388956324655105/-SIvImDX_normal.jpeg",
        "profile_banner_url": "https://pbs.twimg.com/profile_banners/2732221518/1408137241",
        "default_profile": false,
        "default_profile_image": false,
        "following": null,
        "follow_request_sent": null,
        "notifications": null
    },
    "geo": null,
    "coordinates": null,
    "place": null,
    "contributors": null,
    "retweeted_status": {
        "created_at": "Thu Feb 26 12:42:50 +0000 2015",
        "id": 570926965747687400,
        "id_str": "570926965747687425",
        "text": "jQuery Bootstrap Submenu http://t.co/x4nt3VAaQz #javascript #jquery",
        "source": "<a href=\"http://twitter.com\" rel=\"nofollow\">Twitter Web Client</a>",
        "truncated": false,
        "in_reply_to_status_id": null,
        "in_reply_to_status_id_str": null,
        "in_reply_to_user_id": null,
        "in_reply_to_user_id_str": null,
        "in_reply_to_screen_name": null,
        "user": {
            "id": 451429617,
            "id_str": "451429617",
            "name": "jQuery Rain",
            "screen_name": "jquery_rain",
            "location": "",
            "url": "http://www.jqueryrain.com",
            "description": "3500+ Ultimate Collection of jQuery Plugins,Html5 CSS3  JavaScript Tutorials with Demos #jquery #html5 #css3 #javascript #TeamFollowBack",
            "protected": false,
            "verified": false,
            "followers_count": 121435,
            "friends_count": 104350,
            "listed_count": 1012,
            "favourites_count": 3,
            "statuses_count": 4413,
            "created_at": "Sat Dec 31 12:46:11 +0000 2011",
            "utc_offset": 19800,
            "time_zone": "New Delhi",
            "geo_enabled": false,
            "lang": "en",
            "contributors_enabled": false,
            "is_translator": false,
            "profile_background_color": "FFFFFF",
            "profile_background_image_url": "http://pbs.twimg.com/profile_background_images/611972917/9bh757b8m4lihf24uhuq.png",
            "profile_background_image_url_https": "https://pbs.twimg.com/profile_background_images/611972917/9bh757b8m4lihf24uhuq.png",
            "profile_background_tile": true,
            "profile_link_color": "DC005A",
            "profile_sidebar_border_color": "C0DEED",
            "profile_sidebar_fill_color": "DDEEF6",
            "profile_text_color": "333333",
            "profile_use_background_image": true,
            "profile_image_url": "http://pbs.twimg.com/profile_images/2424733190/9h4dkhjwzqyq0vhck4nk_normal.png",
            "profile_image_url_https": "https://pbs.twimg.com/profile_images/2424733190/9h4dkhjwzqyq0vhck4nk_normal.png",
            "profile_banner_url": "https://pbs.twimg.com/profile_banners/451429617/1401793444",
            "default_profile": false,
            "default_profile_image": false,
            "following": null,
            "follow_request_sent": null,
            "notifications": null
        },
        "geo": null,
        "coordinates": null,
        "place": null,
        "contributors": null,
        "retweet_count": 9,
        "favorite_count": 10,
        "entities": {
            "hashtags": [
                {
                    "text": "javascript",
                    "indices": [
                        48,
                        59
                    ]
                },
                {
                    "text": "jquery",
                    "indices": [
                        60,
                        67
                    ]
                }
            ],
            "trends": [],
            "urls": [
                {
                    "url": "http://t.co/x4nt3VAaQz",
                    "expanded_url": "http://goo.gl/YRXznT",
                    "display_url": "goo.gl/YRXznT",
                    "indices": [
                        25,
                        47
                    ]
                }
            ],
            "user_mentions": [],
            "symbols": []
        },
        "favorited": false,
        "retweeted": false,
        "possibly_sensitive": false,
        "filter_level": "low",
        "lang": "en"
    },
    "retweet_count": 0,
    "favorite_count": 0,
    "entities": {
        "hashtags": [
            {
                "text": "javascript",
                "indices": [
                    83,
                    84
                ]
            },
            {
                "text": "jquery",
                "indices": [
                    83,
                    84
                ]
            }
        ],
        "trends": [],
        "urls": [
            {
                "url": "http://t.co/x4nt3VAaQz",
                "expanded_url": "http://goo.gl/YRXznT",
                "display_url": "goo.gl/YRXznT",
                "indices": [
                    83,
                    84
                ]
            }
        ],
        "user_mentions": [
            {
                "screen_name": "jquery_rain",
                "name": "jQuery Rain",
                "id": 451429617,
                "id_str": "451429617",
                "indices": [
                    3,
                    15
                ]
            }
        ],
        "symbols": []
    },
    "favorited": false,
    "retweeted": false,
    "possibly_sensitive": false,
    "filter_level": "low",
    "lang": "en",
    "timestamp_ms": "1424959208505"
}];
}
console.log('server up and running');

