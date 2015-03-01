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

var activeRadioID = 'chocradio';
var activedataset = chocolatedataset;

var xScale = d3.scale.ordinal()
				.domain(d3.range(activedataset.length))
				.rangeRoundBands([0, w], 0.05);

var yScale = d3.scale.linear()
				.domain([0, d3.max( activedataset, function(d) { 
					return d.retweets; 
				})])
				.range([10, h]);

var colorScale = d3.scale.linear()
				   .domain( [0, d3.max( activedataset, function(d) { return d.retweets; })])
				   .range([25, 50]);

var validHashTags = [ 'chocolate', 'cheese', 'candy' ];
var validDataSets = { 'chocolate': chocolatedataset, 'cheese': cheesedataset, 'candy': candydataset};
var hashToRadioID = { 'chocolate': 'chocradio', 'cheese': 'cheeseradio', 'candy': 'candyradio'};
var hashToXScale = { 'chocolate': xScale, 'cheese': xScale, 'candy': xScale};
var hashToYScale = { 'chocolate': yScale, 'cheese': yScale, 'candy': yScale};

function fillColor( d ){
	switch( activeRadioID ){
		case ('chocradio') :
		case ('stopradio') :
			return "hsla(353, 100%," + (colorScale(d.retweets)) + "%,1)";
		case( 'cheeseradio'):
		case( 'goradio'):
			return "hsla(143, 90%," + (colorScale(d.retweets)) + "%,1)";
		case( 'candyradio'):
		case( 'continueradio'):
			return "hsla(240, 60%," + (colorScale(d.retweets)) + "%,1)";
		default:
			return "hsla(258, 0%, 100%, 1)";
	}
}
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
  //console.log( 'Tweet text: ' + text );
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
  //console.log( 'In addOrUpdateTweetInDataset - looking up OrigTweetID: ' + origTweetID);
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
	        console.log( 'Retweet count went from: ' + elem.retweets + ' to: ' + tweetObject.retweets);
	        whichDataSet[i] = tweetObject;
	        updated = true;
	      }
	    });
	    if( updated === true ) {
	    	console.log( 'Updated retweet count');
	    }
	    else{
	    	// original tweet wasn't found so stick it in as a new tweet
	    	whichDataSet.push( tweetObject );
	    }
  	  };
  	  resetDataSet( hash, whichDataSet );
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
    var retweets = getRetweetCount(tweet);
    // create the object we want to store 
    var tweetObject = { "origTweetID": originalTweetID, "text": text, "hashtag": hash, "retweets": retweets };

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
			//activeXScale = hashToXScale[ hash ];
			//activeYScale = hashToYScale[ hash ];
			console.log( 'Currently active graph dataset has been changed so update the graph');
			updateActiveGraph( activedataset );
		}
		else {
			console.log( 'The currently active graph has not been changed.');
			// update dataset for inactive graph
		//	resetDataSet( updatedDataSet );		
		}
    };
    // else {
    // 	console.log( "Tweet was for a hashtag we aren't interested in so ignore it." );
    // };
});

resetDataSet = function( hash, dataset ) {
	var radio = hashToRadioID[ hash ];
	switch( radio ){
		case ('chocradio') :
			chocolatedataset = dataset;
			break;
		case ('stopradio') :
			stopdataset = dataset;
			break;
		case( 'cheeseradio'):
			cheesedataset = dataset;
			break;
		case( 'goradio'):
			godataset = dataset;
			break;
		case( 'candyradio'):
			candydataset = dataset;
			break;
		case( 'continueradio'):
			continuedataset = dataset;
			break;
		default:
			console.log( 'No default dataset!!');
	}
};

createInitialGraph = function(){
	// force acivedataset to stopdataset for now
	activedataset = chocolatedataset;
	//activeXScale = chocolateXScale;
	//activeYScale = chocolateYScale;
	//Create bars
	svg.selectAll("rect")
	   .data( activedataset)
	   .enter()
	   .append("rect")
	   .attr( { "x" : function (d, i) {return xScale(i);} ,
	   		    "y": function (d) { return h - yScale(d.retweets); },
	   			"width": xScale.rangeBand(),
	   			"height": function (d) {	return yScale(d.retweets); },
	   			"fill": function (d) {return fillColor( d );	}
	    })
	   .on("mouseover", function(d) {

			//Get this bar's x/y values, then augment for the tooltip
			var xPosition = parseFloat(d3.select(this).attr("x")) + xScale.rangeBand() / 2;
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

};

updateActiveGraph = function( newDataSet ) {

	//Update scale domains
	xScale.domain(d3.range(newDataSet.length));
	yScale.domain([0, d3.max(newDataSet, function(d) {return d.retweets;})]);
	colorScale.domain( [d3.min(newDataSet, function(d) {return d.retweets}), d3.max(newDataSet, function(d) {return d.retweets})] );
	//Select…
	var bars = svg.selectAll("rect")			//Select all bars
				  .data(newDataSet);			//Re-bind data to existing bars, return the 'update' selection
												//'bars' is now the update selection
	
	//Enter…
	bars.enter()				//References the enter selection (a subset of the update selection)
		.append("rect")			//Creates a new rect
		.attr( { "x" : w, //Sets the initial x position of the rect beyond the far right edge of the SVG
	   		    "y": function(d) {
	   					console.log( 'Y Scale for retweet count: ' + d.retweets + ' : ' + yScale(d.retweets)) ;
	   					return h - yScale(d.retweets);
	   				  },
	   			"width": xScale.rangeBand(),
	   			"height": function(d) {
	   						return yScale(d.retweets);
	   					  },
	   			"fill": function(d) {
							return fillColor( d );
	   					}
	    })
	    .on("mouseover", function(d) {

			//Get this bar's x/y values, then augment for the tooltip
			var xPosition = parseFloat(d3.select(this).attr("x")) + xScale.rangeBand() / 2;
			var yPosition = parseFloat(d3.select(this).attr("y")) / 2 + h / 2;

			//Update the tooltip position and value
			d3.select("#tooltip")
			  .style("left", xPosition + "px")
			  .style("top", yPosition + "px")						
			  .select("#value")
			  .text(d.retweets + '. ' + d.origTweetID + ' : ' + d.text);
	   
			//Show the tooltip
			d3.select("#tooltip")
			  .classed("hidden", false);

	   })
	   .on("mouseout", function() {
			//Hide the tooltip
			d3.select("#tooltip")
			  .classed("hidden", true);
	   });

	//Update…
	bars.transition()							//Initiate a transition on all elements in the update selection (all rects)
		.duration(500)
		.attr("x", function(d, i) {				//Set new x position, based on the updated xScale
			return xScale(i);
		})
		.attr("y", function(d) {				//Set new y position, based on the updated yScale
			return h - yScale(d.retweets);
		})
		.attr("width", xScale.rangeBand())		//Set new width value, based on the updated xScale
		.attr("height", function(d) {			//Set new height value, based on the updated yScale
			return yScale(d.retweets);
		});
		
	//Exit…
	bars.exit()				//References the exit selection (a subset of the update selection)
		.transition()		//Initiates a transition on the elements we're deleting
		.duration(500)
		.attr("x", w)		//Move past the right edge of the SVG
		.remove();   		//Deletes this element from the DOM once transition is complete

};
setActiveDataSet = function (radioID){
	//d3.select(this).classed( 'clicked', true);
	activeRadioID = radioID;
	console.log( 'Active Radio Button: ' + activeRadioID);
	//Set activedataset to be the dateset of the graph selected with the radio button
	if( activeRadioID === 'stopradio' ) activedataset = stopdataset;
	else if( activeRadioID === 'goradio' ) activedataset = godataset;
	else if( activeRadioID === 'chocradio') activedataset = chocolatedataset;
	else if( activeRadioID === 'cheeseradio') activedataset = cheesedataset;
	else if( activeRadioID === 'candyradio') activedataset = candydataset;
	else activedataset = continuedataset;

	console.log( 'activedataset: ' + activedataset);
};
$(document).ready( function (){
    
   createInitialGraph();

	//On click, display data from that graph's dataset			
	d3.selectAll("input")
	  .on("click", function() {
	  		console.log( 'CHANGING GRAPHS' );
	  		setActiveDataSet(d3.select(this).attr("id"));
	  		
			updateActiveGraph( activedataset);

		});	
    d3.selectAll('rect')
       .on("mouseover", function(d) {

			//Get this bar's x/y values, then augment for the tooltip
			var xPosition = parseFloat(d3.select(this).attr("x")) + xScale.rangeBand() / 2;
			var yPosition = parseFloat(d3.select(this).attr("y")) / 2 + h / 2;

			//Update the tooltip position and value
			d3.select("#tooltip")
			  .style("left", xPosition + "px")
			  .style("top", yPosition + "px")						
			  .select("#value")
			  .text(d.origTweetID + ' : ' + d.text);
	   
			//Show the tooltip
			d3.select("#tooltip")
			  .classed("hidden", false);

	   })
	   .on("mouseout", function() {
			//Hide the tooltip
			d3.select("#tooltip")
			  .classed("hidden", true);
	   });
