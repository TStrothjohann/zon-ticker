var dateFormat = require('dateformat');

function Ticker(liveData, teamHash){
  this.liveData = liveData;
  this.teamHash = teamHash;
  this.data = {};
  this.data.moreLink = "http://www.zeit.de/thema/fussball-em";
  this.data.liveLink = "http://www.zeit.de/em-ticker";
  this.liveStates = {
    "LIVE": "LIVE",
    "HALF-TIME": "LIVE",
    "HALF-EXTRATIME": "LIVE",
    "PENALTY-SHOOTOUT": "LIVE"      
  };
  this.offStates = {
    "WITHDRAWN": "abgesetzt",
    "POSTPONED": "abgesagt",
    "CANCELED": "ausgefallen",
    "DISCARDED": "gestrichen"
  };
  this.upcomingStates = {
    "REVOKED": "verlegt, ",
    "PRE-MATCH": ""
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
    self.statusText(callbackStatus);
  }
  var callbackStatus = function(){
    self.scores();
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
  if(link) this.data.moreLink = link;
};

Ticker.prototype.liveLink = function(link) {
  if(link) this.data.liveLink = link;
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

Ticker.prototype.statusText = function(callback){
  var dateOptions = {month: "long", day: "numeric", hour: "2-digit", minute: "2-digit"};
  
  for (var i = 0; i < this.data.games.length; i++) {
    var status = this.data.games[i].status;
    var date = new Date(this.data.games[i].date);
    var dateString = dateFormat(date, "dd.mm, HH:MM");
    if( date.toDateString() === new Date().toDateString() ){
      dateString = "heute, " + dateFormat(date, "HH:MM");
    } 
    
    if(status === 'LIVE'){
      dateString = 'live';
    }
    if(status === 'FULL'){
      dateString = "";
      dateString += this.data.games[i].teamHome.score.total;
      dateString += ":";
      dateString += this.data.games[i].teamAway.score.total;
      dateString += " (";
      dateString += this.data.games[i].teamHome.score.period1;
      dateString += ":";
      dateString += this.data.games[i].teamAway.score.period1;
      dateString += ")";
    }

    this.data.games[i].statusText = dateString;
  }  
  if(callback){
    callback()
  };
};

Ticker.prototype.scores = function() {
  for (var i = 0; i < this.data.games.length; i++) {
    if(!this.data.games[i].teamHome.score.total){
      this.data.games[i].teamHome.score.total = '-';
      this.data.games[i].teamAway.score.total = '-';
    }
  }  
};

module.exports = Ticker;