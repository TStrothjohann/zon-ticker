function Ticker(liveData, teamHash){
  this.liveData = liveData;
  this.teamHash = teamHash;
  this.data = {};
  this.data.link = "http://www.zeit.de/thema/europameisterschaft";
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
    self.addFlags(callbackFlags);
  }
  var callbackFlags = function(){
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
    this.data.games[i].teamHome.teamName = this.teamHash[this.data.games[i].teamHome.teamId].name
    this.data.games[i].teamHome.countrycode = this.teamHash[this.data.games[i].teamHome.teamId].countrycode
    this.data.games[i].teamAway.teamName = this.teamHash[this.data.games[i].teamAway.teamId].name
    this.data.games[i].teamAway.countrycode = this.teamHash[this.data.games[i].teamAway.teamId].countrycode
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
};

Ticker.prototype.moreLink = function(link) {
  if(link) this.data.link = link;
};

Ticker.prototype.addFlags = function(callback){
  var classBase = "flag-icon-";
  var countries = {
    "Albanien": "al",
    "Belgien": "be",
    "Deutschland": "de",
    "England": "gb-eng",
    "Frankreich": "fr",
    "Island": "is",
    "Italien": "it",
    "Kroatien": "hr",
    "Nordirland": "gb-nir",
    "Österreich": "at",
    "Polen": "pl",
    "Portugal": "pt",
    "Irland": "ie",
    "Rumänien": "ro",
    "Russland": "ru",
    "Schweden": "se",
    "Schweiz": "ch",
    "Slowakei": "sk",
    "Spanien": "es",
    "Tschechien": "cz",
    "Türkei": "tr",
    "Ukraine": "ua",
    "Ungarn": "hu",
    "Wales": "gb-wls"
  }


  for (var i = 0; i < this.data.games.length; i++) {
    this.data.games[i].teamHome.flag = classBase + countries[this.data.games[i].teamHome.teamName];
    this.data.games[i].teamAway.flag = classBase + countries[this.data.games[i].teamAway.teamName];
  }
  if(callback){
    callback();
  }
};

module.exports = Ticker;