function TeamData(fs, request, teamDataUrl, callback) {
  var writePath = "./app/cache/team.json";
  var self = this;
  var error;


  fs.stat(writePath, function(err, stats){
    if(err){
      return false;
    } 
    var lastModified = new Date(stats.mtime);
    console.log(stats.size);
    if(lastModified > Date.now() - 1000*60*60*24 && stats.size > 5){
      console.log("getting Team Data from cache.");
      self.getDataFromCache(fs, writePath, callback);
    }else{
      console.log("getting Team data from server.")
      self.getDataFromServer(fs, request, teamDataUrl, writePath, callback);
    }
  })
}

TeamData.prototype.getDataFromServer = function(fs, request, teamDataUrl, writePath, callback){
  var writeStream = fs.createWriteStream(writePath);
  var file = request(teamDataUrl).pipe(writeStream);
  var self = this;
  var error = false;

  file.on('close', function () {
    fs.readFile(writePath, function(err, data){
      if(err){ 
        console.log("error TeamData.js: ", err);
        error = {'Fehler': 'Teamdaten konnten nicht aktualisiert werden.'};
        callback(error, data);
      }else{
        var teamDataJson = JSON.parse( data.toString() );
        var hash = self.convertTeamData(teamDataJson);
        callback(error, hash);        
      }
    });
  });
};

TeamData.prototype.getDataFromCache = function(fs, writePath, callback){
  var self = this;
  var error = false;
  fs.readFile(writePath, function(err, data){
    console.log(writePath);
    if(err){
      error = {'Fehler': 'Teamdaten konnten nicht gelesen werden.'};
      callback(error, "no data");
      console.log("no data");
    }else{
      var teamDataJson, hash;
      var error = false;
      try{
        teamDataJson = JSON.parse( data.toString() );
        hash = self.convertTeamData(teamDataJson);
      }catch(e){
        error = {'Fehler': 'Teamdaten konnten nicht geparsed werden.'};
      }
      callback(error, hash);
    }
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