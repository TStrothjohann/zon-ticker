var request = require("request");
var fileSystem = require("fs");
var base_url = "http://localhost:3000/"
var Ticker = require("../app/Ticker.js");
var testData = require("./helpers/testData/test_data.js");
var TestData = new testData();
var testTeamData = TestData.team;
var testLiveData = TestData.live;
var teamHash = convertTeamData(testTeamData);

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

describe("liveTicker", function() {
  var ticker;

  beforeEach(function() {
    ticker = new Ticker(testLiveData, teamHash);
  });

  it("should take and provide team and dpa data", function() {
    expect(ticker.teamHash["t117"]).toEqual({ name: 'Nordirland', countrycode: 'NIR' });
    expect(ticker.liveData.round).toEqual("1");
  });

  it("it should know which games are planned", function(){
    ticker.sortGames();
    expect(ticker.data.games.length).toBeGreaterThan(0);
  });

  it("should show which teams are playing", function() {
    ticker.sortGames();
    ticker.teamNames();
    expect(ticker.data.games[0].teamAway.teamName).toEqual("Rumänien");
    expect(ticker.data.games[0].teamHome.teamName).toEqual("Frankreich");
  });

  describe("Game states", function() {
    it("it should know when a game is PRE-MATCH", function() {
      ticker.sortGames();
      expect(ticker.data.games[0].status).toEqual("PRE-MATCH");
    });

    it("it should sort LIVE games first", function() {
      testLiveData.fixture[3].status = "LIVE";
      ticker = new Ticker(testLiveData, teamHash);
      ticker.sortGames();
      expect(ticker.data.games[0].status).toEqual("LIVE");
    });

    it("it should handle other lively states", function() {
      testLiveData.fixture[3].status = "LIVE";
      testLiveData.fixture[7].status = "HALF-TIME";
      testLiveData.fixture[9].status = "HALF-EXTRATIME";
      testLiveData.fixture[10].status = "PENALTY-SHOOTOUT";
      
      ticker = new Ticker(testLiveData, teamHash);
      ticker.sortGames();
      expect(ticker.data.games[0].status).toEqual("LIVE");
      expect(ticker.data.games[1].status).toEqual("HALF-TIME");
      expect(ticker.data.games[2].status).toEqual("HALF-EXTRATIME");
      expect(ticker.data.games[3].status).toEqual("PENALTY-SHOOTOUT");
    });
  });

  describe("Server", function() {
    describe("GET /", function() {
      it("returns status code 200", function(done) {
        request.get(base_url, function(error, response, body) {
          expect(response.statusCode).toBe(200);
          done();
        });
      });

      it("returns tickerData json", function(done) {
        var apiPath = base_url + "ticker-data";
        request.get(apiPath, function(error, response, body) {
          var parsedBody = JSON.parse(body);
          expect(parsedBody.games[0].eventId).toEqual("838507");
          expect(parsedBody.games[0].teamHome.teamName).toEqual("Frankreich");
          done();
        });
      });

      it("has an last updated timestamp", function(done){
        var apiPath = base_url + "ticker-data";
        request.get(apiPath, function(error, response, body) {
          var parsedBody = JSON.parse(body);
          var nowPlus = Date.now() + 20000;
          expect( new Date(parsedBody.updated) ).toBeLessThan(nowPlus);
          done();
        });
      });

      it("serves a more link", function(done){
        var apiPath = base_url + "ticker-data";
        request.get(apiPath, function(error, response, body) {
          var parsedBody = JSON.parse(body);
          expect( parsedBody.link ).toEqual("http://www.zeit.de/thema/europameisterschaft");
          done();
        });
      });

      it("serves an image link for every team", function(done){
        var apiPath = base_url + "ticker-data";
        request.get(apiPath, function(error, response, body) {
          var parsedBody = JSON.parse(body);
          expect( parsedBody.games[0].teamHome.flag ).toEqual("flag-icon-fr");
          done();
        });
      });

      it("also serves three letter country codes", function(done){
        var apiPath = base_url + "ticker-data";
        request.get(apiPath, function(error, response, body) {
          var parsedBody = JSON.parse(body);
          expect( parsedBody.games[0].teamHome.countrycode ).toEqual("FRA");
          done();
        });        
      })

    });
  });

});

//////ToDo:
// Server crawls live- and teamData - mocked with test data in test
// App produces tickerData-Object
// Server serves tickerData-Object


///// States ////
// it should know when a game is live (LIVE)
// it should know when a game is in half-time (HALF-TIME)
// it should know when a game is in half-time-extratime (HALF-EXTRATIME)
// it should know when a game is in second half (?)
// it should know when a game is in penalties (PENALTY-SHOOTOUT)
// it should know when a game is over (FULL)
// it should show when a game was revoked, withdrawn, canceled, discarded or postponed

///// Features ////
// 
// it should update when a goal has happened
// it should link to live-tickers if there is one 
// it should show the current time of live games
// it should auto-update on hp
// it should be refreshable on article pages
// it should show the time of the last refresh
// it shouldn't show excluded games
// it should order the games live first and then by time

///// Infrastructure ////
// It serves a json file no matter what traffic comes
// It doesn't block any page load
// It emit events for ad Reloads and tracking purposes


////// Design /////
// it should show the teams flags
// it should show live games more prominently than upcomin or games that are over
// it should be swipe- and slideable on mobile
// it should show the phase/day of the tournament
// it should handle 0-3 live games


//Does it have to handle placeholders?
