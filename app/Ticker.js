function Ticker(liveData, teamHash){
  this.liveData = liveData;
  this.teamHash = teamHash;
  this.data = {};
  this.liveStates = {
    "LIVE": "LIVE",
    "HALF-TIME": "LIVE",
    "HALF-EXTRATIME": "LIVE",
    "PENALTY-SHOOTOUT": "LIVE"      
  };
}

Ticker.prototype.sortGamesAndReplaceNames = function(response){
  var self = this;
  var callback = function(){
    self.teamNames(callbackNames);
  }
  var callbackNames = function(){
    self.data.updated = Date.now();
    console.log(self.data.updated);
    response.json(self.data);
  }
  this.sortGames(callback);
};

Ticker.prototype.sortGames = function(callback) {
  this.data.games = this.liveData.fixture;

  var orderedGames = [];
  var liveGames = [];
  var nonLiveGames = [];

  for (var i = 0; i < this.data.games.length; i++) {
    if( this.isLive(this.data.games[i].status)){
      liveGames.push(this.data.games[i]);
    }else{
      nonLiveGames.push(this.data.games[i]);
    }
  }

  nonLiveGames.sort(function(a,b){
    return new Date(a.date) - new Date(b.date);
  });

  orderedGames = orderedGames.concat(liveGames);
  this.data.games = orderedGames.concat(nonLiveGames);
  if(callback){
    callback();
  }
};

Ticker.prototype.teamNames = function(callback) {
  for (var i = 0; i < this.data.games.length; i++) {
    this.data.games[i].teamHome.teamName = this.teamHash[this.data.games[i].teamHome.teamId]
    this.data.games[i].teamAway.teamName = this.teamHash[this.data.games[i].teamAway.teamId]
  }
  if(callback){
    callback();
  }
};

Ticker.prototype.isLive = function(status) {
  if(this.liveStates[status]){
    return true;
  }else{
    return false;
  }
}

module.exports = Ticker;