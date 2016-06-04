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

app.get("/live-data", function(req, res) {
  var callback = function(data){
    ticker = new Ticker(data, testTeamHash);
    ticker.sortGamesAndReplaceNames(res);
  };
  var liveDataObject = new LiveData(request, liveDataUrl, callback);
});

app.get("/team-data", function(req, res) {
  new TeamData(fs, request, teamDataUrl, res);
});

app.listen(3000);