function LiveData(request, fs, url, callback){
  this.writePath = "./app/cache/live.json";
  this.liveData = {};
  this.teamData = {};
  this.refreshLiveData(request, fs, url, callback);
}

LiveData.prototype.refreshLiveData = function(request, fs, dataurl, callback){
  var self = this;
  var writeStream = fs.createWriteStream(self.writePath);

  var file = request(dataurl).pipe(writeStream);


  file.on('finish', function(){
    fs.readFile(self.writePath, function(err, data){
      if(err) res.json(err);
      var dataJson = JSON.parse( data.toString() );
      callback(dataJson);
    });
    
  })
};

module.exports = LiveData;