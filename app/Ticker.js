function Ticker(liveData, teamHash){
  this.liveData = liveData;
  this.teamHash = teamHash;
  this.data = {};
}

Ticker.prototype.sortGames = function() {
  this.data.games = this.liveData.fixture;
};

Ticker.prototype.teamNames = function() {

  for (var i = 0; i < this.data.games.length; i++) {
    this.data.games[i].teamHome.teamId = this.teamHash[this.data.games[i].teamHome.teamId]
    this.data.games[i].teamAway.teamId = this.teamHash[this.data.games[i].teamAway.teamId]
  }

};

module.exports = Ticker;