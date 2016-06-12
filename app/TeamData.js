function TeamData(fs, request, teamDataUrl, callback) {
  var writePath = "./app/cache/team.json";
  var writeStream = fs.createWriteStream(writePath);
  var file = request(teamDataUrl).pipe(writeStream);
  var self = this;
  var error;
  
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
}

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