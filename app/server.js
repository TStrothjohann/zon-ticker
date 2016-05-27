var express = require('express');
var app = express();
var fileSystem = require('fs');
var Ticker = require("../app/mainPromise.js");
var ticker = new Ticker(fileSystem);


app.get("/", function(req, res) {
  var data = {hello: "world"};
  res.json(data);
});


app.get("/liveData", function(req, res) {
  var data = ticker.liveData;
  res.json(data);
});

app.listen(3000);