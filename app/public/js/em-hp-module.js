var markup;
var dataURL;

var poll = function(urlToPoll) {
  var data = {};
  var prepareMarkup = function(jsondata){
    if(!tickerDiv){
      var tickerDiv = document.getElementById('em-ticker');
      var tickerArticle = tickerDiv.getElementsByTagName('article');
      var teaserContainer = tickerDiv.getElementsByClassName("sport-ticker--container")[0];

      for (var i = 0; i < jsondata.games.length; i++) {
        var regex = /[0]/g;
        var node = tickerArticle[0].cloneNode(true);
        node.classList.add(jsondata.games[i].status);
        var string = node.innerHTML;
        string = string.replace(regex, i)
        node.innerHTML = string;
        if(i !== 0){
          teaserContainer.appendChild(node);
        }
      }
      tickerArticle[0].classList.add(jsondata.games[0].statusClass);    
      markup = tickerDiv.innerHTML;
    }
  }

  var HTTPrequest = new XMLHttpRequest();
  HTTPrequest.open('GET', urlToPoll, true);

  HTTPrequest.onload = function() {
    if (HTTPrequest.status >= 200 && HTTPrequest.status < 400) {
      // Success!
      data = JSON.parse(HTTPrequest.responseText);
      if(!markup){
        prepareMarkup(data);
      }
      if(data !== {} && markup){
        var markupToMessWith = markup;
        document.getElementById('em-ticker').innerHTML = findAndReplaceHandleBars(markupToMessWith, data);
      }
    } else {
        console.log("server error");
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
      var objectValue; 
      
      try {
        objectValue = eval( "liveData." + match[1] ); 
      } catch (e) {
        if (e instanceof SyntaxError) {
            objectValue = "";
            console.log(e.message);
        } else {
            objectValue = "";
            console.log(e.message);
        }
      }
      
      tickerMarkup = tickerMarkup.replace(nextHandles, objectValue);
    }
    return tickerMarkup.replace(/[\r\t\n]/g, '');
  }
};

if(!dataURL || dataURL === ""){
  dataURL = "http://52.58.6.8:3000/live-data"
}
poll(dataURL);
setInterval(function(){
 poll(dataURL);
}, 10000);

