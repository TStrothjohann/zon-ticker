function LiveData(request, url, callback){
  this.liveData = {};
  this.teamData = {};
  this.refreshLiveData(request, url, callback);
}

LiveData.prototype.refreshLiveData = function(request, dataurl, callback){
  var error = false;
  var data = '';
  request
    .get({url:dataurl, json:true })
    .on('error', function(error){
      console.log("error in request in liveData.js: ", error)
    })
    .on('data', function(chunk){
      data += chunk;
    })
    .on('end', function(){
      try{
        this.liveData = JSON.parse( data.toString() );
      }catch(err){
        console.log("error when parsing fresh live data", data);
        error = true;
      }
      callback(error, this.liveData);  
    })
};

module.exports = LiveData;