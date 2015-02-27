var socket = io.connect('http://localhost:3000');
var maxValue = 100;
	//Width and height
var w = 600;
var h = 250;
//Create SVG element
var svg = d3.select("#graph")
				.append("svg")
				.attr("width", w)
				.attr("height", h);

var activeRadioID = 'chocradio';
var activedataset = [];
var activeXScale, activeYScale, stopXScale, stopYScale, goXScale, goYScale, continueXScale, continueYScale,
	 chocXScale, chocYScale, cheeseXScale, cheeseYScale, candyXScale, candyYScale;

var stopdataset = [ { origTweetID: '1', text: 'No bleach at breakfast!', retweets: 1 },
						{ origTweetID: '2',text: 'Old food in the fridge', retweets: 2 }];
var godataset = [ { origTweetID: '3',text: 'More homework everyday!', retweets: 2 },
				  { origTweetID: '4',text: 'Pizza fridays!!', retweets: 12 }
				];
var continuedataset = [ { origTweetID: '5',text: 'Whisky on Fridays', retweets: 10 },
						{ origTweetID: '6',text: 'More d3!', retweets: 22 }
					  ];
var chocolatedataset = [ { origTweetID: '1', text: 'No bleach at breakfast!', retweets: 1 },
						{ origTweetID: '2',text: 'Old food in the fridge', retweets: 2 }];
var cheesedataset = [ { origTweetID: '3',text: 'More homework everyday!', retweets: 2 },
				  { origTweetID: '4',text: 'Pizza fridays!!', retweets: 12 }
				];
var candydataset = [ { origTweetID: '5',text: 'Whisky on Fridays', retweets: 10 },
						{ origTweetID: '6',text: 'More d3!', retweets: 22 }
					  ];
// var stopdataset = [ 5, 10, 20, 15, 18 ]
var stopXScale = d3.scale.ordinal()
				.domain(d3.range(stopdataset.length))
				.rangeRoundBands([0, w], 0.05);

var stopYScale = d3.scale.linear()
				.domain([0, d3.max( stopdataset, function(d) {
					console.log( 'in max(): retweet: ' + d.retweets);
    				return d.retweets;
				  })])
				.range([0, h]);

var chocolateXScale = d3.scale.ordinal()
				.domain(d3.range(chocolatedataset.length))
				.rangeRoundBands([0, w], 0.05);

var chocolateYScale = d3.scale.linear()
				.domain([0, d3.max( chocolatedataset, function(d) {
					console.log( 'in max(): retweet: ' + d.retweets);
    				return d.retweets;
				  })])
				.range([0, h]);
var validHashTags = [ 'chocolate', 'cheese', 'candy' ];
var validDataSets = { 'chocolate': chocolatedataset, 'cheese': cheesedataset, 'candy': candydataset};
var hashToRadioID = { 'chocolate': 'chocradio', 'cheese': 'cheeseradio', 'candy': 'candyradio'};
var hashToXScale = { 'chocolate': chocolateXScale, 'cheese': cheeseXScale, 'candy': candyXScale};
var hashToYScale = { 'chocolate': chocolateYScale, 'cheese': cheeseYScale, 'candy': candyYScale};

tweetIsARetweet = function( originalID, retweets, dataset ){
	return dataset.some( function( elem, i ) {
			if( elem.origTweetID === originalID /*&& retweets > 0*/) {
				return true;
			};
		});
};
updateRetweetCount = function( originalID, retweets, dataset ) {
	dataset.forEach( function( elem, i ) {
		if( elem.origTweetID === originalID ) {
			elem.retweets = retweets;
		};
	});
};

function regexFormatter (tweet){
  var tweetText = tweet.text;
  var regex = /\S*#(?:[[^]]+]|\S+)/g;
  var formatter = regex.exec(tweetText);
  if( formatter === null || formatter.length === 0) {
    return '';
  };
  var hash = formatter[0].slice(1);
  console.log( 'Hash: '+ hash);
  if( hash !== '' && hash !==null) {
    	hash = hash.toLowerCase();
  };
  return hash;
};

function getOriginalTweetText( tweet ) {
  var text;
  // if not a retweet
  if( tweet.retweeted_status === undefined ) {
    text = tweet.text;
  }
  else { // if a retweet, get original tweet text
    text = tweet.retweeted_status.text;
  };
  console.log( 'Tweet text: ' + text );
  return text;
};
function getRetweetCount( tweet ){
  var retweets;
  if( tweet.retweeted_status === undefined ) {
    retweets = 0;
  }
  else {
    retweets = tweet.retweeted_status.retweet_count;
  };
  console.log( 'Retweet Count: ' + retweets );
  return retweets;
};

function getOriginalTweetId(tweet){
  // this function will extract the ID of the original tweet
  // if this tweet is a retweet then we wil get the original tweet's id
  var id;
  if( tweet.retweeted_status === undefined ) {
    id = tweet.id;
  }
  else {
    id = tweet.retweeted_status.id;
  };
  console.log( 'Original Tweet ID: ' + id );
  return id;
};

function addOrUpdateTweetInDataset( tweet, tweetObject ){
  // if new tweet for one of our three hashtags then push into appropriate dataset
  // else if a retweet then update retweet count
  var updated = false;
  var hash = tweetObject.hashtag;
  var origTweetID = tweetObject.origTweetID;
  console.log( 'In addOrUpdateTweetInDataset - looking up OrigTweetID: ' + origTweetID);
  var whichDataSet = validDataSets[ hash ];
  if( whichDataSet !== undefined ) {
	  if( tweet.retweeted_status === undefined ) {
	    console.log( 'New tweet so push to global array. ID: ' + origTweetID);
	    whichDataSet.push( tweetObject );
	  }
	  else {
	    whichDataSet.forEach( function( elem, i ) {
	      if( elem.origTweetID === origTweetID ) {
	        console.log( 'Found tweet for ID: ' + origTweetID + 'Update retweet count' );
	        console.log( 'Retweet count went from: ' + elem.retweetCount + ' to: ' + tweetObject.retweetCount);
	        whichDataSet[i] = tweetObject;
	        updated = true;
	      }
	    });
	    if( updated === true ) {
	    	console.log( 'Updated retweet count');
	    	//console.log( allTweets);
	    };
  	  };
	  return whichDataSet;
  }
  else {
  	console.log( "In addOrUpdateTweetInDataset - couldn't find correct dataset" );
  	return activedataset;
  };
};

function extractDataIntoDataSet( tweet ) {
	var hash = regexFormatter( tweet );
    var text = getOriginalTweetText( tweet );
    var originalTweetID = getOriginalTweetId( tweet );
    var retweetCount = getRetweetCount(tweet);
    // create the object we want to store 
    var tweetObject = { "origTweetID": originalTweetID, "text": text, "hashtag": hash, "retweetCount": retweetCount };

    return addOrUpdateTweetInDataset( tweet, tweetObject );
};

socket.on( 'verify', function (data) {
			console.log( 'Socket reply from Server');
});

socket.on('oldtweets', function( data ){
	// this will only be called when the server is started or restarted
	// Loop through all tweets and call socket.on('tweet')'s helper function
	// mimicking the one by one tweet event
	// OR, add all tweets to dataset and add that to the SVG
	//var arr = data.split(',');
	//console.log( 'In oldtweets: ' + arr);
	
	console.log( 'Exiting socket.on(oldtweets)');
});
socket.on('tweet', function (tweet) {
	console.log( 'Received new tweet: ' );
	
	//** STRIP OUT INFORMATION WE ARE INTERESTED IN AND STORE IN APPROPRIATE DATASET ***///
	// if tweet is for one of the hash tags we want to display then update datasets
	
	var hash = regexFormatter( tweet );
	if( validHashTags.indexOf( hash ) !== -1 ) { 
		var updatedDataSet = extractDataIntoDataSet (tweet);
		
		// if tweet is for the currently active graph then update the graph
		if ( hashToRadioID[ hash ] === activeRadioID ) {
			activedataset = updatedDataSet;
			activeXScale = hashToXScale[ hash ];
			activeYScale = hashToYScale[ hash ];
			console.log( 'Currently active graph dataset has been changed so update the graph');
			updateActiveGraph( activedataset );
		}
		else {
			console.log( 'The currently active graph has not been changed.');
		}

		// add new data to correct dataset
	    // var originalID = tweet.origTweetID;
	   
	    // activeRadioID = 'javascriptradio';
	    // console.log( 'Hash: ' + hashTag );
	    // console.log( 'ActiveGraph: ' + activeRadioID );
	    // if( hashTag === 'javascript' ) {
	    // 	console.log( 'Update retweet count or Push new Stop tweet to dataset');
	    // 	if( tweetIsARetweet( originalID, data.retweetCount, stopdataset )) {
	    // 		updateRetweetCount( originalID, data.retweetCount, stopdataset );
	    // 	}
	    // 	else {
	    // 		stopdataset.push( {origTweetID: originalID, text: data.text, retweets: data.retweetCount } );
	    // 	};
	    // 	if( activeRadioID === 'javascriptradio' ) activedataset = stopdataset;
	    // }
	    // else if( hashTag === 'go' ) {
	    // 	console.log( 'Push new go tweet to dataset');
	    // 	godataset.push( {text: data.text, retweets: data.retweetCount } );
	    // 	if( activeRadioID === 'goradio' ) activedataset = godataset;
	    // }
	    // else if( hashTag === 'continue' ) {
	    // 	console.log( 'Push new continue tweet to dataset');
	    // 	continuedataset.push( {text: data.text, retweets: data.retweetCount } );
	    // 	if( activeRadioID === 'continueradio' ) activedataset = continuedataset;
	    // };
	    // // if the active graph is the same as the hash of the new tweet then 
	    // // update the graph with the new tweet
	    
	    // if( (hashTag !== undefined && hashTag !== '') && activeRadioID.indexOf(hashTag) !== -1 ) {
	    // 	console.log( 'New tweet received for active graph, update!');
	    // 	updateActiveGraph( activedataset );
	    // }
	    // else{
	    // 	console.log('Active graph is not the same as this tweet hashtag: ' + hashTag );
	    // };
    }
    else {
    	console.log( "Tweet was for a hashtag we aren't interested in so ignore it." );
    };
});

getRGBColor = function( retweets ) {
	var retweets = ( retweets === 0 )? 1 : retweets;
	if( activeRadioID === 'stopradio' || activeRadioID === 'chocradio') {
		//redscale colors
		return "rgb(" + (retweets*10) + ", 0, 0)";
	}
	else if( activeRadioID === 'goradio' || activeRadioID === 'cheeseradio') {
		//greenscale colors
		return "rgb(0," + (retweets*10) + ",0)";
	}
	else {
		//bluescale colors
		return "rgb(0,0," + (retweets*10) + ")";
	};
};
createInitialGraph = function(){
	// force acivedataset to stopdataset for now
	activedataset = chocolatedataset;
	activeXScale = chocolateXScale;
	activeYScale = chocolateYScale;
	//Create bars
	svg.selectAll("rect")
	   .data( activedataset)
	   .enter()
	   .append("rect")
	   .attr( { "x" : function(d, i) {
	   		     		return activeXScale(i);
	          		} ,
	   		    "y": function(d) {
	   					console.log( 'Y Scale for retweet count: ' + d.retweets + ' : ' +activeYScale(d.retweets)) ;
	   					return h - activeYScale(d.retweets);
	   				  },
	   			"width": activeXScale.rangeBand(),
	   			"height": function(d) {
	   						return activeYScale(d.retweets);
	   					  },
	   			"fill": function(d) {
							return getRGBColor( d.retweets );
	   					}
	    })
	   .on("mouseover", function(d) {

			//Get this bar's x/y values, then augment for the tooltip
			var xPosition = parseFloat(d3.select(this).attr("x")) + activeXScale.rangeBand() / 2;
			var yPosition = parseFloat(d3.select(this).attr("y")) / 2 + h / 2;

			//Update the tooltip position and value
			d3.select("#tooltip")
			  .style("left", xPosition + "px")
			  .style("top", yPosition + "px")						
			  .select("#value")
			  .text(d.text);
	   
			//Show the tooltip
			d3.select("#tooltip")
			  .classed("hidden", false);

	   })
	   .on("mouseout", function() {
			//Hide the tooltip
			d3.select("#tooltip")
			  .classed("hidden", true);
	   });


	//Create labels
	// d3.select('svg').selectAll("text")
	//    .data(activedataset)
	//    .enter()
	//    .append("text")
	//    .text(function(d) {
	//    		return d.text;
	//    })
	//    .attr("text-anchor", "middle")
	//    .attr("x", function(d, i) {
	//    		return activeXScale(i) + activeXScale.rangeBand() / 2;
	//    })
	//    .attr("y", function(d) {
	//    		return h - activeYScale(d.retweets) + 14;
	//    })
	//    .attr("font-family", "sans-serif")
	//    .attr("font-size", "11px")
	//    .attr("fill", "white");
};

updateActiveGraph = function( newDataSet ) {

	//Update scale domains
	activeXScale.domain(d3.range(newDataSet.length));
	activeYScale.domain([0, d3.max(newDataSet, function(d) {
    							return d.retweets;
				  			})
						]);
	//Select…
	var bars = svg.selectAll("rect")			//Select all bars
				  .data(newDataSet);			//Re-bind data to existing bars, return the 'update' selection
												//'bars' is now the update selection
	
	//Enter…
	bars.enter()								//References the enter selection (a subset of the update selection)
		.append("rect")							//Creates a new rect
		.attr( { "x" : w, //Sets the initial x position of the rect beyond the far right edge of the SVG
	   		    "y": function(d) {
	   					console.log( 'Y Scale for retweet count: ' + d.retweets + ' : ' +activeYScale(d.retweets)) ;
	   					return h - activeYScale(d.retweets);
	   				  },
	   			"width": activeXScale.rangeBand(),
	   			"height": function(d) {
	   						return activeYScale(d.retweets);
	   					  },
	   			"fill": function(d) {
							return getRGBColor( d.retweets );
	   					}
	    });
		// .on("mouseover", function(d) {

		// 	//Get this bar's x/y values, then augment for the tooltip
		// 	var xPosition = parseFloat(d3.select(this).attr("x")) + activeXScale.rangeBand() / 2;
		// 	var yPosition = parseFloat(d3.select(this).attr("y")) / 2 + h / 2;

		// 	//Update the tooltip position and value
		// 	d3.select("#tooltip")
		// 		.style("left", xPosition + "px")
		// 		.style("top", yPosition + "px")						
		// 		.select("#value")
		// 		.text(d.text);
	   
		// 	//Show the tooltip
		// 	d3.select("#tooltip").classed("hidden", false);

	 //   })
	 //   .on("mouseout", function() {
			   
		// 	//Hide the tooltip
		// 	d3.select("#tooltip").classed("hidden", true);
					
	 //   });

	//Update…
	bars.transition()							//Initiate a transition on all elements in the update selection (all rects)
		.duration(500)
		.attr("x", function(d, i) {				//Set new x position, based on the updated xScale
			return activeXScale(i);
		})
		.attr("y", function(d) {				//Set new y position, based on the updated yScale
			return h - activeYScale(d.retweets);
		})
		.attr("width", activeXScale.rangeBand())		//Set new width value, based on the updated xScale
		.attr("height", function(d) {			//Set new height value, based on the updated yScale
			return activeYScale(d.retweets);
		});
		
	//Exit…
	bars.exit()				//References the exit selection (a subset of the update selection)
		.transition()		//Initiates a transition on the elements we're deleting
		.duration(500)
		.attr("x", w)		//Move past the right edge of the SVG
		.remove();   		//Deletes this element from the DOM once transition is complete


	//Update all labels
//  	var labels = svg.selectAll("text")
// 	   				.data(activedataset);
// //Enter…
// 	labels.enter()								//References the enter selection (a subset of the update selection)
// 		.append("text")							//Creates a new text
// 		.text(function(d) {
// 		   		return d.text;
// 		 })						
// 		.attr("x", w)							//Sets the initial x position of the rect beyond the far right edge of the SVG
// 		.attr("y", function(d) {				//Sets the y value, based on the updated yScale
// 			return h - activeYScale(d.retweets) + 14;
// 		});

//    	labels.transition()
//        	   .duration(1600)
//            .ease( 'linear')
// 		   .text(function(d) {
// 		   		return d.text;
// 		   })
// 		   .attr("x", function(d, i) {
// 		   		return activeXScale(i) + activeXScale.rangeBand() / 2;
// 		   })
// 		   .attr("y", function(d) {
// 		   		return h - activeYScale(d.retweets) + 14;
// 		   })
// 		   .attr("font-family", "sans-serif")
// 	   	   .attr("font-size", "11px")
// 	       .attr("fill", "white");

// 	   //Exit…
// 	labels.exit()				//References the exit selection (a subset of the update selection)
// 	   	  .transition()		//Initiates a transition on the elements we're deleting
// 		  .duration(500)
// 		  .attr("x", w)		//Move past the right edge of the SVG
// 		  .remove();  


};
setActiveDataSet = function (activeRadioID){
	//d3.select(this).classed( 'clicked', true);
	
	//Set activedataset to be the dateset of the graph selected with the radio button
	if( activeRadioID === 'stopradio' ) activedataset = stopdataset;
	else if( activeRadioID === 'goradio' ) activedataset = godataset;
	else if( activeRadioID === 'chocradio') activedataset = chocolatedataset;
	else if( activeRadioID === 'cheeseradio') activedataset = cheesedataset;
	else if( activeRadioID === 'candyradio') activedataset = candydataset;
	else activedataset = continuedataset;

};
$(document).ready( function (){
    
   createInitialGraph();

	//On click, display data from that graph's dataset			
	d3.selectAll("input")
	  .on("click", function() {
	  		setActiveDataSet(d3.select(this).attr("id"));
	  		
			updateActiveGraph( activedataset);
	  		// createNewGraph();

		});	
    d3.selectAll('rect')
       .on("mouseover", function(d) {

			//Get this bar's x/y values, then augment for the tooltip
			var xPosition = parseFloat(d3.select(this).attr("x")) + activeXScale.rangeBand() / 2;
			var yPosition = parseFloat(d3.select(this).attr("y")) / 2 + h / 2;

			//Update the tooltip position and value
			d3.select("#tooltip")
			  .style("left", xPosition + "px")
			  .style("top", yPosition + "px")						
			  .select("#value")
			  .text(d.text);
	   
			//Show the tooltip
			d3.select("#tooltip")
			  .classed("hidden", false);

	   })
	   .on("mouseout", function() {
			//Hide the tooltip
			d3.select("#tooltip")
			  .classed("hidden", true);
	   });

});
			
   //          //var numValues = dataset.length; //Count original length of dataset
            
   //    		activeXScale.domain(d3.range(activedataset.length));

   //          activeYScale.domain([0, d3.max(activedataset, function(d) {
   //  				return d.retweets;
			// 	  })]);
			// //Update all rects
			// svg.selectAll("rect")			   
			// 	.data(activedataset)
   //              .transition()
   //              .delay(function(d, i) {
   //                  return i / activedataset.length * 1000;  
   //                })
   //              .duration(500)
   //              .ease('linear')
			//    .attr("y", function(d) {
			//    		return h - activeYScale(d.retweets);
			//    })
			//    .attr("height", function(d) {
			//    		return activeYScale(d.retweets);
			//    })
			//    .attr("fill", function(d) {
			// 		return "rgb(0, 0, " + (d.retweets * 10) + ")";
			//    });

			// //Update all labels
		 // 	svg.selectAll("text")
			//    .data(activedataset)
   //             .transition()
   //             .duration(1600)
   //             .ease( 'linear')
			//    .text(function(d) {
			//    		return d.text;
			//    })
			//    .attr("x", function(d, i) {
			//    		return activeXScale(i) + activeXScale.rangeBand() / 2;
			//    })
			//    .attr("y", function(d) {
			//    		return h - activeYScale(d.retweets) + 14;
			//    });
			   				
		// });
 // });

 // var socket = io.connect('http://localhost:3000');
// var maxValue = 100;
// 	//Width and height
// var w = 600;
// var h = 250;
// //Create SVG element
// var svg = d3.select("body")
// 				.append("svg")
// 				.attr("width", w)
// 				.attr("height", h);

// var activeRadioID = 'stopradio';
// var activedataset, stopdataset, godataset, continuedataset = [];
// var activeXScale, activeYScale, stopXScale, stopYScale, goXScale, goYScale, continueXScale, continueYScale;

// var stopdataset = [ { origTweetID: '1', text: 'No bleach at breakfast!', retweets: 16 },
// 						{ origTweetID: '2',text: 'Old food in the fridge', retweets: 10 }];
// var godataset = [ { origTweetID: '3',text: 'More homework everyday!', retweets: 2 },
// 				  { origTweetID: '4',text: 'Pizza fridays!!', retweets: 12 }
// 				];
// var continuedataset = [ { origTweetID: '5',text: 'Whisky on Fridays', retweets: 10 },
// 						{ origTweetID: '6',text: 'More d3!', retweets: 22 }
// 					  ];

// // var stopdataset = [ 5, 10, 20, 15, 18 ]
// var stopXScale = d3.scale.ordinal()
// 				.domain(d3.range(stopdataset.length))
// 				.rangeRoundBands([0, w], 0.05);

// var stopYScale = d3.scale.linear()
// 				.domain([0, d3.max( stopdataset, function(d) {
// 					console.log( 'in max(): retweet: ' + d.retweets);
//     				return d.retweets;
// 				  })])
// 				.range([0, h]);

// tweetIsARetweet = function( originalID, retweets, dataset ){
// 	return dataset.some( function( elem, i ) {
// 			if( elem.origTweetID === originalID && retweets > 0) {
// 				return true;
// 			};
// 		});
// };
// updateRetweetCount = function( originalID, retweets, dataset ) {
// 	dataset.forEach( function( elem, i ) {
// 		if( elem.origTweetID === originalID ) {
// 			elem.retweets = retweets;
// 		};
// 	});
// };
// socket.on( 'verify', function (data) {
// 			console.log( 'Socket reply from Server');
// });

// socket.on('oldtweets', function( data ){
// 	// this will only be called when the server is started or restarted
// 	// Loop through all tweets and call socket.on('tweet')'s helper function
// 	// mimicking the one by one tweet event
// 	// OR, add all tweets to dataset and add that to the SVG
// 	var arr = data.split(',');
// 	console.log( 'In oldtweets: ' + arr);
	
// 	console.log( 'Exiting socket.on(oldtweets)');
// });
// socket.on('tweet', function (data) {
// 	console.log( 'Received new tweet: ' + data );
// 	// add new data to correct dataset
//     var originalID = data.origTweetID;
//     var hashTag = data.hashtag;
//     if( hashTag !== '' && hashTag !==null) {
//     	hashTag = hashTag.toLowerCase();
//     };
//     activeRadioID = 'javascriptradio';
//     console.log( 'Hash: ' + hashTag );
//     console.log( 'ActiveGraph: ' + activeRadioID );
//     if( hashTag === 'javascript' ) {
//     	console.log( 'Update retweet count or Push new Stop tweet to dataset');
//     	if( tweetIsARetweet( originalID, data.retweetCount, stopdataset )) {
//     		updateRetweetCount( originalID, data.retweetCount, stopdataset );
//     	}
//     	else {
//     		stopdataset.push( {origTweetID: originalID, text: data.text, retweets: data.retweetCount } );
//     	};
//     	if( activeRadioID === 'javascriptradio' ) activedataset = stopdataset;
//     }
//     else if( hashTag === 'go' ) {
//     	console.log( 'Push new go tweet to dataset');
//     	godataset.push( {text: data.text, retweets: data.retweetCount } );
//     	if( activeRadioID === 'goradio' ) activedataset = godataset;
//     }
//     else if( hashTag === 'continue' ) {
//     	console.log( 'Push new continue tweet to dataset');
//     	continuedataset.push( {text: data.text, retweets: data.retweetCount } );
//     	if( activeRadioID === 'continueradio' ) activedataset = continuedataset;
//     };
//     // if the active graph is the same as the hash of the new tweet then 
//     // update the graph with the new tweet
    
//     if( (hashTag !== undefined && hashTag !== '') && activeRadioID.indexOf(hashTag) !== -1 ) {
//     	console.log( 'New tweet received for active graph, update!');
//     	updateActiveGraph( activedataset );
//     }
//     else{
//     	console.log('Active graph is not the same as this tweet hashtag: ' + hashTag );
//     }
// });

// createInitialGraph = function(){
// 	// force acivedataset to stopdataset for now
// 	activedataset = stopdataset;
// 	activeXScale = stopXScale;
// 	activeYScale = stopYScale;
// 	//Create bars
// 	svg.selectAll("rect")
// 	   .data( activedataset)
// 	   .enter()
// 	   .append("rect")
// 	   .attr("x", function(d, i) {
// 	   		return activeXScale(i);
// 	   })
// 	   .attr("y", function(d) {
// 	   		console.log( 'Y Scale for retweet count: ' + d.retweets + ' : ' +activeYScale(d.retweets)) ;
// 	   		return h - activeYScale(d.retweets);
// 	   })
// 	   .attr("width", activeXScale.rangeBand())
// 	   .attr("height", function(d) {
// 	   		return activeYScale(d.retweets);
// 	   })
// 	   .attr("fill", function(d) {
// 			var retweets = ( d.retweets === 0 )? 1 : d.retweets;
// 			if( activeRadioID === 'stopradio' || activeRadioID === 'javascriptradio') {
// 				return "rgb(" + (retweets * 10) + ", 0, 0)";
// 			}
// 			else if ( activeRadioID === 'goradio') {
// 				return "rgb(0," + (retweets * 10) + ", 0)";
// 			}
// 			else {
// 				return "rgb(0, 0, " + (retweets * 10) + ")";
// 			};
// 	   })
// 	   .on("mouseover", function(d) {

// 			//Get this bar's x/y values, then augment for the tooltip
// 			var xPosition = parseFloat(d3.select(this).attr("x")) + activeXScale.rangeBand() / 2;
// 			var yPosition = parseFloat(d3.select(this).attr("y")) / 2 + h / 2;

// 			//Update the tooltip position and value
// 			d3.select("#tooltip")
// 				.style("left", xPosition + "px")
// 				.style("top", yPosition + "px")						
// 				.select("#value")
// 				.text(d.text);
	   
// 			//Show the tooltip
// 			d3.select("#tooltip").classed("hidden", false);

// 	   })
// 	   .on("mouseout", function() {
			   
// 			//Hide the tooltip
// 			d3.select("#tooltip").classed("hidden", true);
					
// 	   });


// 	//Create labels
// 	// d3.select('svg').selectAll("text")
// 	//    .data(activedataset)
// 	//    .enter()
// 	//    .append("text")
// 	//    .text(function(d) {
// 	//    		return d.text;
// 	//    })
// 	//    .attr("text-anchor", "middle")
// 	//    .attr("x", function(d, i) {
// 	//    		return activeXScale(i) + activeXScale.rangeBand() / 2;
// 	//    })
// 	//    .attr("y", function(d) {
// 	//    		return h - activeYScale(d.retweets) + 14;
// 	//    })
// 	//    .attr("font-family", "sans-serif")
// 	//    .attr("font-size", "11px")
// 	//    .attr("fill", "white");
// };

// updateActiveGraph = function( newDataSet ) {

// 	//Update scale domains
// 	activeXScale.domain(d3.range(newDataSet.length));
// 	activeYScale.domain([0, d3.max(newDataSet, function(d) {
//     							return d.retweets;
// 				  			})]);
// 	//Select…
// 	var bars = svg.selectAll("rect")			//Select all bars
// 				  .data(newDataSet);			//Re-bind data to existing bars, return the 'update' selection
// 												//'bars' is now the update selection
	
// 	//Enter…
// 	bars.enter()								//References the enter selection (a subset of the update selection)
// 		.append("rect")							//Creates a new rect
// 		.attr("x", w)							//Sets the initial x position of the rect beyond the far right edge of the SVG
// 		.attr("y", function(d) {				//Sets the y value, based on the updated yScale
// 			return h - activeYScale(d.retweets);
// 		})
// 		.attr("width", activeXScale.rangeBand())		//Sets the width value, based on the updated xScale
// 		.attr("height", function(d) {			//Sets the height value, based on the updated yScale
// 			return activeYScale(d.retweets);
// 		})
// 		.attr("fill", function(d) {				//Sets the fill value
// 			var retweets = ( d.retweets === 0 )? 1 : d.retweets;

// 			if( activeRadioID === 'stopradio' || activeRadioID === 'javascriptradio') {
// 				// red scale first
// 				return "rgb(" + (retweets * 10) + ", 0, 0)";
// 			}
// 			else if ( activeRadioID === 'goradio') { 
// 				// green scale
// 				return "rgb(0," + (retweets * 10) + ", 0)";
// 			}
// 			else { 
// 				// blue scale
// 				return "rgb(0, 0, " + (retweets * 10) + ")";
// 			};			
// 		});
// 		// .on("mouseover", function(d) {

// 		// 	//Get this bar's x/y values, then augment for the tooltip
// 		// 	var xPosition = parseFloat(d3.select(this).attr("x")) + activeXScale.rangeBand() / 2;
// 		// 	var yPosition = parseFloat(d3.select(this).attr("y")) / 2 + h / 2;

// 		// 	//Update the tooltip position and value
// 		// 	d3.select("#tooltip")
// 		// 		.style("left", xPosition + "px")
// 		// 		.style("top", yPosition + "px")						
// 		// 		.select("#value")
// 		// 		.text(d.text);
	   
// 		// 	//Show the tooltip
// 		// 	d3.select("#tooltip").classed("hidden", false);

// 	 //   })
// 	 //   .on("mouseout", function() {
			   
// 		// 	//Hide the tooltip
// 		// 	d3.select("#tooltip").classed("hidden", true);
					
// 	 //   });

// 	//Update…
// 	bars.transition()							//Initiate a transition on all elements in the update selection (all rects)
// 		.duration(500)
// 		.attr("x", function(d, i) {				//Set new x position, based on the updated xScale
// 			return activeXScale(i);
// 		})
// 		.attr("y", function(d) {				//Set new y position, based on the updated yScale
// 			return h - activeYScale(d.retweets);
// 		})
// 		.attr("width", activeXScale.rangeBand())		//Set new width value, based on the updated xScale
// 		.attr("height", function(d) {			//Set new height value, based on the updated yScale
// 			return activeYScale(d.retweets);
// 		});
// 	//Exit…
// 	bars.exit()				//References the exit selection (a subset of the update selection)
// 		.transition()		//Initiates a transition on the elements we're deleting
// 		.duration(500)
// 		.attr("x", w)		//Move past the right edge of the SVG
// 		.remove();   		//Deletes this element from the DOM once transition is complete


// 	//Update all labels
// //  	var labels = svg.selectAll("text")
// // 	   				.data(activedataset);
// // //Enter…
// // 	labels.enter()								//References the enter selection (a subset of the update selection)
// // 		.append("text")							//Creates a new text
// // 		.text(function(d) {
// // 		   		return d.text;
// // 		 })						
// // 		.attr("x", w)							//Sets the initial x position of the rect beyond the far right edge of the SVG
// // 		.attr("y", function(d) {				//Sets the y value, based on the updated yScale
// // 			return h - activeYScale(d.retweets) + 14;
// // 		});

// //    	labels.transition()
// //        	   .duration(1600)
// //            .ease( 'linear')
// // 		   .text(function(d) {
// // 		   		return d.text;
// // 		   })
// // 		   .attr("x", function(d, i) {
// // 		   		return activeXScale(i) + activeXScale.rangeBand() / 2;
// // 		   })
// // 		   .attr("y", function(d) {
// // 		   		return h - activeYScale(d.retweets) + 14;
// // 		   })
// // 		   .attr("font-family", "sans-serif")
// // 	   	   .attr("font-size", "11px")
// // 	       .attr("fill", "white");

// // 	   //Exit…
// // 	labels.exit()				//References the exit selection (a subset of the update selection)
// // 	   	  .transition()		//Initiates a transition on the elements we're deleting
// // 		  .duration(500)
// // 		  .attr("x", w)		//Move past the right edge of the SVG
// // 		  .remove();  


// };
// setActiveDataSet = function (activeRadioID){
// 	//d3.select(this).classed( 'clicked', true);
	
// 	//Set activedataset to be the dateset of the graph selected with the radio button
// 	if( activeRadioID === 'stopradio' ) activedataset = stopdataset;
// 	else if( activeRadioID === 'goradio' ) activedataset = godataset;
// 	else activedataset = continuedataset;

// };
// $(document).ready( function (){
    
//     createInitialGraph();

// 	//On click, display data from that graph's dataset			
// 	d3.selectAll("input")
// 	  .on("click", function() {
//   		activeRadioID = d3.select(this).attr("id");
//   		setActiveDataSet(activeRadioID);
	  		
// 		updateActiveGraph( activedataset);
// 	});	

// 	d3.selectAll("rect")
// 	  	.on("mouseover", function(d) {

// 			//Get this bar's x/y values, then augment for the tooltip
// 			var xPosition = parseFloat(d3.select(this).attr("x")) + activeXScale.rangeBand() / 2;
// 			var yPosition = parseFloat(d3.select(this).attr("y")) / 2 + h / 2;

// 			//Update the tooltip position and value
// 			d3.select("#tooltip")
// 				.style("left", xPosition + "px")
// 				.style("top", yPosition + "px")						
// 				.select("#value")
// 				.text(d.text);
	   
// 			//Show the tooltip
// 			d3.select("#tooltip").classed("hidden", false);

// 	   })
// 	   .on("mouseout", function() {
			   
// 			//Hide the tooltip
// 			d3.select("#tooltip").classed("hidden", true);
					
// 	   });
// });
			
//    //          //var numValues = dataset.length; //Count original length of dataset
            
//    //    		activeXScale.domain(d3.range(activedataset.length));

//    //          activeYScale.domain([0, d3.max(activedataset, function(d) {
//    //  				return d.retweets;
// 			// 	  })]);
// 			// //Update all rects
// 			// svg.selectAll("rect")			   
// 			// 	.data(activedataset)
//    //              .transition()
//    //              .delay(function(d, i) {
//    //                  return i / activedataset.length * 1000;  
//    //                })
//    //              .duration(500)
//    //              .ease('linear')
// 			//    .attr("y", function(d) {
// 			//    		return h - activeYScale(d.retweets);
// 			//    })
// 			//    .attr("height", function(d) {
// 			//    		return activeYScale(d.retweets);
// 			//    })
// 			//    .attr("fill", function(d) {
// 			// 		return "rgb(0, 0, " + (d.retweets * 10) + ")";
// 			//    });

// 			// //Update all labels
// 		 // 	svg.selectAll("text")
// 			//    .data(activedataset)
//    //             .transition()
//    //             .duration(1600)
//    //             .ease( 'linear')
// 			//    .text(function(d) {
// 			//    		return d.text;
// 			//    })
// 			//    .attr("x", function(d, i) {
// 			//    		return activeXScale(i) + activeXScale.rangeBand() / 2;
// 			//    })
// 			//    .attr("y", function(d) {
// 			//    		return h - activeYScale(d.retweets) + 14;
// 			//    });
			   				
// 		// });
//  // });