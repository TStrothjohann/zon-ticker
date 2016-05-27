var request = require("request");
var fileSystem = require("fs");
var base_url = "http://localhost:3000/"
var Ticker = require("../app/Ticker.js");
var testData = require("./helpers/testData/test_data.js");
var TestData = new testData();
var testTeamData = TestData.team;
var testLiveData = TestData.live;


describe("liveTicker", function() {
  var ticker;

  beforeEach(function() {
    ticker = new Ticker(testLiveData, testTeamData);
  });

  it("should take and provide team and dpa data", function() {
    expect(ticker.teamData.teams[0].id).toEqual("t156");
    expect(ticker.liveData.round).toEqual("35");
  });

  describe("Server", function() {
    describe("GET /", function() {
      it("returns status code 200", function(done) {
        request.get(base_url, function(error, response, body) {
          expect(response.statusCode).toBe(200);
          done();
        });
      });

      it("returns json", function(done) {
        request.get(base_url, function(error, response, body) {
          var expectation = JSON.parse('{"hello": "world"}');
          var parsedBody = JSON.parse(body);
          expect(parsedBody).toEqual(expectation);
          done();
        });
      });
    });
  });

});

//////ToDo:
// Produce liveData-Object
// serve liveData-Object


///// States ////
// it should know when a game is upcoming and it's date (PRE-MATCH)
// it should know when a game is live (LIVE)
// it should know when a game is in half-time (HALF-TIME)
// it should know when a game is in half-time-extratime (HALF-EXTRATIME)
// it should know when a game is in second half (?)
// it should know when a game is in penalties (PENALTY-SHOOTOUT)
// it should know when a game is over (FULL)
// it should show when a game was revoked, withdrawn, canceled, discarded or postponed

///// Features ////
// it should show which teams are playing
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

