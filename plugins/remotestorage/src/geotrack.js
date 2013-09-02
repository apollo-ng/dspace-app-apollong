define([
    '../lib/remotestorage',
    '../lib/remotestorage-profile',
    '../lib/remotestorage-geotracks'
], function(remoteStorage, profile, rsGeotracks) {
    function Geotracker(name){
	this.name = name;
	this.storage = {}	
	this._init();
    }
  Geotracker.prototype = {
	  _init : function(){
	    if(this.name){
		    this.store = this._store
		    var storage = this.storage;;
		    if(storage) {
		      for(var t in storage){
			      this.store(storage[t], t)
		      }
		      delete this.storage;
		    }
	    }
	  },
	  store : function(obj, timestamp){
	    //storeing stuff localy until rs is connected and the username gets set through the profile
	    if(!timestamp)
		    timestamp = new Date().getTime();
	    this.storage[timestamp] = obj;
	  },
	  _store : function(obj, timestamp){
      //at the moment geotracker.name is set this replaces geotracker.store
	    rsGeotracks.store(obj, timestamp, this.name).then(undefined, function(e){
		    console.error(e);
	    });
	  },
	  setName : function(name){
	    this.name = name;
	    this._init();
	    console.log('name is now : ', this.name);
	    return name;
	  },
	  show : function(){
      //prinitng the track to the console
      // TODO not very useful that way, probably make the track visible on the map later
	    return rsGeotracks.get(this.name).then(function(mp){
		    console.log(JSON.stringify(mp))
	    })
	},
	  publish : function(){
      //moves the current track to public and prints the link on the console
      // TODO UI integration in any way
	    return rsGeotracks.publish(this.name).then(function(url){
		    console.log('your track is at : ',url);
	    });
	  }
  }
  var geotracker = new Geotracker();
  remoteStorage.on('ready', function(){
	  profile.load().then(function(me){
	    if(me)
		    geotracker.setName(me.screenname);
	    else
		    geotracker.setName('no_name_yet');
	    //FIXME this will lead to confusion 
      // get the name of the track from the ui if possible and abandon the whole profile approach
	  })
  })
  return geotracker;
})
