var request = require("request");
var fileSystem = require("fs");
var base_url = "http://localhost:3000/"
var Ticker = require("../app/Ticker.js");
var LiveData = require("../app/LiveData.js");
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
  var mockResponse = null;
  var mockJsonData = {};

  beforeEach(function() {
    ticker = new Ticker(testLiveData, teamHash);
  });


  beforeEach(function(){
    mockResponse = {
      json: function(data){
        mockJsonData = data;
      }
    };

    spyOn(mockResponse, 'json').and.callThrough();
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

    it("it should write score to statusTex when game is full", function() {
      testLiveData.fixture[3].status = "FULL";
      testLiveData.fixture[3].date = Date.now() + 1000*60*60*24*100;
      testLiveData.fixture[3].teamHome.score = {"total":"5","period1":"2","period2":"3","period3":"0","period4":"0","period5":"0"};
      testLiveData.fixture[3].teamAway.score = {"total":"3","period1":"0","period2":"3","period3":"0","period4":"0","period5":"0"};      
      var last = testLiveData.fixture.length - 1;
      ticker = new Ticker(testLiveData, teamHash);
      ticker.sortGames();
      ticker.statusText();
      expect(ticker.data.games[last].statusText).toEqual("5:3 (2:0)");
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

  it("it writes heute if game is going to be heute", function() {
    testLiveData.fixture[3].status = "PRE-MATCH";
    testLiveData.fixture[3].date = Date.now() + 60*60*1000;
    ticker = new Ticker(testLiveData, teamHash);
    ticker.sortGamesAndReplaceNames(mockResponse);
    expect(mockResponse.json).toHaveBeenCalled();
    expect(mockJsonData.games[3].statusText).toContain('heute, ');
  });

  it("serves the newest score counts", function(){
    testLiveData.fixture[4].status = "LIVE";
    testLiveData.fixture[4].date = Date.now() - 10*60*1000;
    testLiveData.fixture[4].teamHome.score = {"total":"4","period1":"0","period2":"0","period3":"0","period4":"0","period5":"4"};
    testLiveData.fixture[4].teamAway.score = {"total":"1","period1":"1","period2":"0","period3":"0","period4":"0","period5":"0"};

    ticker = new Ticker(testLiveData, teamHash);
    ticker.sortGamesAndReplaceNames(mockResponse);
    expect(mockResponse.json).toHaveBeenCalled();
    expect(mockJsonData.games[0].teamHome.score.total).toEqual('4');
    expect(mockJsonData.games[0].teamAway.score.total).toEqual('1');
    expect(mockJsonData.games[0].statusText).toEqual('live');
  });

  it("serves -:- if the game hasn't started yet", function(){
    testLiveData.fixture[5].status = "PRE-MATCH";
    testLiveData.fixture[5].date = Date.now() + 10*60*1000;

    ticker = new Ticker(testLiveData, teamHash);
    ticker.sortGamesAndReplaceNames(mockResponse);
    expect(mockResponse.json).toHaveBeenCalled();
    expect(mockJsonData.games[1].teamHome.score.total).toEqual('-');
    expect(mockJsonData.games[1].teamAway.score.total).toEqual('-');
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
          expect( parsedBody.moreLink ).toEqual("http://www.zeit.de/thema/fussball-em");
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
      });

      it("serves status names", function(done){
        var apiPath = base_url + "ticker-data";
        request.get(apiPath, function(error, response, body) {
          var parsedBody = JSON.parse(body);
          expect( parsedBody.games[0].statusText ).toEqual( "10.06, 21:00" );
          done();
        });
      });

    });
  });

  describe("get real data", function(){
    it("serves live data", function(done){
      var apiPath = base_url + "live-data";
      request.get(apiPath, function(error, response, body) {
        var parsedBody = JSON.parse(body);
        expect( parsedBody.games[0].statusText ).not.toBe(undefined);
        expect( parsedBody.games[0].date ).not.toBe(undefined);
        expect( parsedBody.games[0].status ).not.toBe(undefined);
        expect( parsedBody.games[0].round ).not.toBe(undefined);
        done();
      });
    });
    
    it("serves team data", function(){
      var teamDataURL = "http://live0.zeit.de/fussball_em/feed/s2016/config/de/dpa/teams.json";
      var callback = function(data){
        expect(data.teams[0].id).not.toBe(undefined);
        expect(data.teams[0].nameShort).not.toBe(undefined);
        expect(data.teams[0].letterCode).not.toBe(undefined);
        expect(data.teams[0].twitter).not.toBe(undefined);
      };
      var teamData = new LiveData(request, teamDataURL, callback);
    });
  })

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
