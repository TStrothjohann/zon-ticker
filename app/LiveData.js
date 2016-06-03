function LiveData(request, url, callback){
  this.liveData = {};
  this.refreshLiveData(request, url, callback);
}

LiveData.prototype.refreshLiveData = function(request, dataurl, callback){
  request
    .get({url:dataurl, json:true })
    .on('error', function(error){
      console.log("error: ", error)
    })
    .on('data', function(data){
      this.liveData = JSON.parse( data.toString() );
      callback(this.liveData);
    })
};

module.exports = LiveData;