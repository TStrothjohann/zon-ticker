var express = require('express');
var app = express();
var Ticker = require("../app/Ticker.js");
var testData = require("../spec/helpers/testData/test_data.js");
var TestData = new testData();
var testTeamData = TestData.team;
var testLiveData = TestData.live;
var teamHash = convertTeamData(testTeamData);
var ticker = new Ticker(testLiveData, teamHash);

function convertTeamData(data){
  var teamHash = {};
  for (var i = 0; i < data.teams.length; i++) {
    teamHash[data.teams[i].id] = data.teams[i].nameShort 
  }
  return teamHash;
}



app.get("/", function(req, res) {
  var data = {hello: "world"};
  res.json(data);
});


app.get("/liveData", function(req, res) {
  var data = ticker.liveData;
  res.json(data);
});

app.listen(3000);