function TeamData(fs, request, teamDataUrl, res) {
  var writePath = "./app/cache/team.json";
  var writeStream = fs.createWriteStream(writePath);
  var file = request(teamDataUrl).pipe(writeStream);
  var self = this;
  file.on('finish', function () {
    fs.readFile(writePath, function(err, data){
      if(err) res.json(err);
      var teamDataJson = JSON.parse( data.toString() );
      var hash = self.convertTeamData(teamDataJson);
      res.json( hash );
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