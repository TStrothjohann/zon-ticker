function Ticker(liveData, teamHash){
  this.liveData = liveData;
  this.teamHash = teamHash;
  this.data = {};
}

Ticker.prototype.sortGames = function() {
  this.data.games = this.liveData.fixture;

  var orderedGames = [];
  var liveGames = [];
  for (var i = 0; i < this.data.games.length; i++) {
    if(this.data.games[i].status === "LIVE"){
      liveGames = this.data.games.splice(i,1);
    }
  }
  
  this.data.games.sort(function(a,b){
    return new Date(a.date) - new Date(b.date);
  });

  for (var i = 0; i < liveGames.length; i++) {
    orderedGames.push(liveGames[i]);
  }

  for (var i = 0; i < this.data.games.length; i++) {
    orderedGames.push(this.data.games[i])
  }

  this.data.games = orderedGames;

};

Ticker.prototype.teamNames = function() {
  for (var i = 0; i < this.data.games.length; i++) {
    this.data.games[i].teamHome.teamId = this.teamHash[this.data.games[i].teamHome.teamId]
    this.data.games[i].teamAway.teamId = this.teamHash[this.data.games[i].teamAway.teamId]
  }
};

module.exports = Ticker;