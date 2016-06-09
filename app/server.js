var express = require('express');
var app = express();
var request = require("request");
var fs = require("fs");
var Ticker = require("../app/Ticker.js");
var LiveData = require("../app/LiveData.js");
var TeamData = require("../app/TeamData.js");
var testData = require("../spec/helpers/testData/test_data.js");
var TestData = new testData();
var testTeamData = TestData.team;
var testLiveData = TestData.live;
var testTeamHash = convertTeamData(testTeamData);

var liveDataUrl = "http://live0.zeit.de/fussball_em/feed/s2016/md3/dpa/onl1.json";
var teamDataUrl = "http://live0.zeit.de/fussball_em/feed/s2016/config/de/dpa/teams.json";
var ticker;

function convertTeamData(data){
  var teamHash = {};
  for (var i = 0; i < data.teams.length; i++) {
    teamHash[data.teams[i].id] = {
      "name" : data.teams[i].nameShort,
      "countrycode": data.teams[i].letterCode
    }
  }
  return teamHash;
}

app.use(express.static('app/public'));

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});


app.get("/", function(req, res) {
  var data = {hello: "world"};
  res.json(data);
});


app.get("/ticker-data", function(req, res) {
  
  ticker = new Ticker(testLiveData, testTeamHash);
  ticker.sortGamesAndReplaceNames(res);
});

app.get("/ticker-data2", function(req, res) {
  var data = TestData.live3;
  data.fixture[2].status = "LIVE";
  for (var i = 0; i < data.fixture.length; i++) {
    var randomScoreHome = Math.floor((Math.random() * 10) + 1);
    var randomScoreAway = Math.floor((Math.random() * 10) + 1);
    data.fixture[i].teamHome.score.total = randomScoreHome;
    data.fixture[i].teamHome.score.period1 = randomScoreHome;
    data.fixture[i].teamAway.score.total = randomScoreAway;
    data.fixture[i].teamAway.score.period1 = randomScoreAway;

    if(data.fixture[i].status === 'LIVE'){
      var gameStart = Date.now() - 1000*60*88;
      var gameStartString = new Date(gameStart).toLocaleString();
      var secondHalfStart = gameStart + (45+3+20)*60*1000;
      var secondHalfStartString = new Date(secondHalfStart).toLocaleString();

      data.fixture[i].date = gameStart;
      data.fixture[i].kickOff = { "periodStart1": gameStartString, "periodStart2": secondHalfStartString}
    }
  }

  ticker = new Ticker(data, testTeamHash);
  ticker.sortGamesAndReplaceNames(res);
});

app.get("/ticker-data3", function(req, res) {
  var data = TestData.live3;
  data.fixture[2].status = "LIVE";
  data.fixture[3].status = "LIVE";
  for (var i = 0; i < data.fixture.length; i++) {
    var randomScoreHome = Math.floor((Math.random() * 10) + 1);
    var randomScoreAway = Math.floor((Math.random() * 10) + 1);
    data.fixture[i].teamHome.score.total = randomScoreHome;
    data.fixture[i].teamHome.score.period1 = randomScoreHome;
    data.fixture[i].teamAway.score.total = randomScoreAway;
    data.fixture[i].teamAway.score.period1 = randomScoreAway;

    if(data.fixture[i].status === 'LIVE'){
      var randomGameDuration = Math.floor((Math.random() * 94) + 1);
      var gameStart = Date.now() - 1000*60*randomGameDuration;
      var gameStartString = new Date(gameStart).toLocaleString();
      var secondHalfStart = gameStart + (45+3+20)*60*1000;
      var secondHalfStartString = new Date(secondHalfStart).toLocaleString();

      data.fixture[i].date = gameStart;
      data.fixture[i].kickOff = { "periodStart1": gameStartString, "periodStart2": secondHalfStartString}
    }
  }

  ticker = new Ticker(data, testTeamHash);
  ticker.sortGamesAndReplaceNames(res);
});


app.get("/live-data", function(req, res) {
  var callback = function(data){
    ticker = new Ticker(data, teamHash);
    ticker.sortGamesAndReplaceNames(res);
  };
  var teamCallback = function(data) {
    teamHash = data;
    var liveDataObject = new LiveData(request, liveDataUrl, callback);
  };
  new TeamData(fs, request, teamDataUrl, teamCallback);

});

app.get("/team-data", function(req, res) {
  var callback = function(data) {
    teamHash = data;
    res.json(teamHash);
  }
  new TeamData(fs, request, teamDataUrl, callback);
});

app.listen(3000);