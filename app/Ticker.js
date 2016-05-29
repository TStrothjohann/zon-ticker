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

Ticker.prototype.sortGames = function() {
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
};

Ticker.prototype.teamNames = function() {
  for (var i = 0; i < this.data.games.length; i++) {
    this.data.games[i].teamHome.teamId = this.teamHash[this.data.games[i].teamHome.teamId]
    this.data.games[i].teamAway.teamId = this.teamHash[this.data.games[i].teamAway.teamId]
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