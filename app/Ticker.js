var dateFormat = require('dateformat');

function Ticker(liveData, teamHash){
  this.liveData = liveData;
  this.teamHash = teamHash;
  this.data = {};
  this.data.round = liveData.round;
  this.data.moreLink = "http://www.zeit.de/thema/fussball-em";
  this.data.liveLink = "http://www.zeit.de/sport/em-liveticker-2016";
  this.liveStates = {
    "LIVE": "LIVE",
    "HALF-TIME": "Halbzeit",
    "HALF-EXTRATIME": "Halbzeit Verlängerung",
    "PENALTY-SHOOTOUT": "Elfmeterschießen"      
  };
  this.offStates = {
    "WITHDRAWN": "abgesetzt",
    "POSTPONED": "abgesagt",
    "CANCELED": "ausgefallen",
    "DISCARDED": "gestrichen"
  };
  this.upcomingStates = {
    "REVOKED": "verlegt, ",
    "PRE-MATCH": "folgt "
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

Ticker.prototype.isOff = function(status) {
  if(this.offStates[status]){
    return true;
  }else{
    return false;
  }
};

Ticker.prototype.isUpcoming = function(status) {
  if(this.upcomingStates[status]){
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
    var periods = Object.keys(this.data.games[i].kickOff);
    var current = periods.length - 1;
    var status = this.data.games[i].status;
    var date = new Date(this.data.games[i].date);
    var tomorrow = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
    var dateString = dateFormat(date, "dd.mm, HH:MM");
    
    if(this.isUpcoming(status)){
      if( date.toDateString() === new Date().toDateString() ){
        dateString = "heute, " + dateFormat(date, "HH:MM") + " Uhr";
      }
      if( date.toDateString() === tomorrow.toDateString() ){
        dateString = "morgen, " + dateFormat(date, "HH:MM") + " Uhr";
      }
      this.data.games[i].statusClass = "PRE-MATCH";
    }

    
    if(this.isLive(status)){

      var minutes = 0;
      if(periods.length < 1){
        dateString = 'live'
      }else if(periods && periods.length === 1){
        var now = Date.now();
        var start = new Date(this.data.games[i].kickOff.periodStart1);
        var elapsed = now - start;
        minutes = Math.floor(elapsed / 1000 / 60);
        if (minutes-45 > 0) {
          dateString = "45' + " + String(minutes-45);
        }else{
          if(status !== "LIVE"){
            dateString = this.liveStates[status];
          }else{
            dateString = String(minutes) + "'"; 
          }
        }
      }else{
        var now = Date.now();
        var start = new Date(this.data.games[i].kickOff[ periods[current] ]);
        var elapsed = Math.floor((now - start)/1000/60);
        minutes = (current*45) + elapsed; 
        dateString = String(minutes) + "'";
      }
      this.data.games[i].statusClass = "LIVE";
    }

    if(this.isOff(status)){
      dateString = this.offStates[status];
      this.data.games[i].statusClass = "PRE-MATCH";
    }

    if(status === 'FULL'){
      var now = Date.now();
      var start = new Date(this.data.games[i].kickOff[ periods[current] ]);

      if( (now - start)/1000/60 > 90 ){
        dateString = "";
        dateString += this.data.games[i].teamHome.score.total;
        dateString += ":";
        dateString += this.data.games[i].teamAway.score.total;
        dateString += " (";
        dateString += this.data.games[i].teamHome.score.period1;
        dateString += ":";
        dateString += this.data.games[i].teamAway.score.period1;
        dateString += ")";
        this.data.games[i].statusClass = "FULL";
      }else{
        dateString = "beendet";
        this.data.games[i].statusClass = "LIVE";
      }
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