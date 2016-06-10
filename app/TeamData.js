function TeamData(fs, request, teamDataUrl, callback) {
  var writePath = "./app/cache/team.json";
  var self = this;

  fs.stat(writePath, function(err, stats){
    if(err) return false;
    var lastModified = new Date(stats.mtime);
    if(lastModified > Date.now() - 1000*60*60*24){
      console.log("getting Data from cache.")
      self.getDataFromCache(fs, writePath, callback);
    }else{
      console.log("getting data from server.")
      self.getDataFromServer(fs, request, teamDataUrl, writePath, callback);
    }
  })

}

TeamData.prototype.getDataFromServer = function(fs, request, teamDataUrl, writePath, callback){
  var writeStream = fs.createWriteStream(writePath);
  var file = request(teamDataUrl).pipe(writeStream);
  var self = this;

  file.on('finish', function () {
    fs.readFile(writePath, function(err, data){
      if(err) res.json(err);
      var teamDataJson = JSON.parse( data.toString() );
      var hash = self.convertTeamData(teamDataJson);
      callback( hash );
    });
  });
};

TeamData.prototype.getDataFromCache = function(fs, writePath, callback){
  var self = this;
  fs.readFile(writePath, function(err, data){
    if(err) res.json(err);
    var teamDataJson = JSON.parse( data.toString() );
    var hash = self.convertTeamData(teamDataJson);
    callback( hash );
  });
};

TeamData.prototype.convertTeamData = function(data){
  var teamHash = {};
  for (var i = 0; i < data.teams.length; i++) {
    teamHash[data.teams[i].id] = {
      "name" : data.teams[i].nameShort,
      "countrycode": data.teams[i].letterCode
    }
  }
  return teamHash;
}

module.exports = TeamData;