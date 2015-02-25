var stopArray = [];
	goArray = [],
	continueArray = [];

function fetchData(){
function setInterval($.ajax({
url: "http://localhost:8000/tweets",
success: function(data) {
var sl = data.stop.length; //the stop array received from the server
var gl = data.go.length;
var cl = data.continue.length;
for(var i = 0; i < sl; i++){
if (stopArray[i].text === undefined) {
stopArray.push(data.stop[i]);
}
stopArray[i].count = data.stop[i].count;

        }
        for(var i = 0; i < gl; i++){
            if (goArray[i].text === undefined) {
                goArray.push(data.go[i]);
            }
            goArray[i].count = data.go[i].count;
        }
        for(var i = 0; i < cl; i++){
            if (continueArray[i].text === undefined) {
                continueArray.push(data.continue[i]); 
            }

            continueArray[i].count = data.continue[i].count;
        }
    }
}), 3000)
}
