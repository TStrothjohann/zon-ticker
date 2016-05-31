var HTTPrequest = new XMLHttpRequest();
HTTPrequest.open('GET', 'http://localhost:3000/ticker-data', true);
var data = {};
var markup = document.getElementById('em-ticker').innerHTML;

HTTPrequest.onload = function() {
  if (HTTPrequest.status >= 200 && HTTPrequest.status < 400) {
    // Success!
    data = JSON.parse(HTTPrequest.responseText);
    if(data !== {} && markup){
      document.getElementById('em-ticker').innerHTML = findAndReplaceHandleBars(markup, data);
    }
  } else {
    // We reached our target server, but it returned an error
  }
};

HTTPrequest.onerror = function() {
  console.log("There was a connection error of some sort");
};

HTTPrequest.send();


//Templating
function findAndReplaceHandleBars(tickerMarkup, liveData){
  var regex = /{{(.*?)}}/;
  while(regex.test(tickerMarkup)){
    var match = regex.exec(tickerMarkup);
    var nextHandles = match[0];
    var objectValue = eval( "liveData." + match[1] );
    tickerMarkup = tickerMarkup.replace(nextHandles, objectValue);
  }
  return tickerMarkup.replace(/[\r\t\n]/g, '');
}