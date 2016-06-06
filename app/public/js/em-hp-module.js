var markup;

var poll = function() {
  var data = {};
  
  var prepareMarkup = function(jsondata){
    if(!tickerDiv){
      var tickerDiv = document.getElementById('em-ticker');
      var tickerArticle = tickerDiv.getElementsByTagName('article');
      var teaserContainer = tickerDiv.getElementsByClassName("teaser-ticker-group__container")[0];

      for (var i = 0; i < jsondata.games.length; i++) {
        var regex = /[0]/g;
        var node = tickerArticle[0].cloneNode(true);
        var string = node.innerHTML;
        string = string.replace(regex, i)
        node.innerHTML = string;
        if(i !== 0){
          teaserContainer.appendChild(node);
        }
      }    
      markup = tickerDiv.innerHTML;
    }
  }

  var HTTPrequest = new XMLHttpRequest();
  HTTPrequest.open('GET', 'http://localhost:3000/ticker-data2', true);

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

poll();
// setInterval(function(){
//  poll();
//  console.log("polled");
// }, 10000);

