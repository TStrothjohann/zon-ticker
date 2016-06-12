function LiveData(request, fs, url, callback){
  this.writePath = "./app/cache/live.json";
  this.liveData = {};
  this.teamData = {};
  var self = this;

  fs.stat(self.writePath, function(err, stats){
    if(err) return false;
    var lastModified = new Date(stats.mtime);
    if(lastModified > Date.now() - 1000*10){
      console.log("getting Data from cache.", self.writePath);
      self.getDataFromCache(request, fs, self.writePath, url, callback);
    }else{
      console.log("getting data from server.")
      self.refreshLiveData(request, fs, url, callback);
    }
  })
  
}

LiveData.prototype.refreshLiveData = function(request, fs, dataurl, callback){
  var self = this;
  var writeStream = fs.createWriteStream(self.writePath);

  var file = request(dataurl).pipe(writeStream);


  file.on('finish', function(){
    fs.readFile(self.writePath, function(err, data){
      if(err){
        console.log(self.writePath, err);
      }
      var dataJson = JSON.parse( data.toString() );
      callback(dataJson);
    });
    
  })
};

LiveData.prototype.getDataFromCache = function(request, fs, writePath, dataurl, callback){
  var self = this;
  fs.readFile(writePath, function(err, data){
    if(err){
      self.refreshLiveData(request, fs, dataurl, callback)
    }
    var dataJson = JSON.parse( data.toString() );
    callback(dataJson);
  }); 
};

module.exports = LiveData;