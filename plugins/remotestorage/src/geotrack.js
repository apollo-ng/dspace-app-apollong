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
	    console.log("to local");
	    if(!timestamp)
		timestamp = new Date().getTime();
	    this.storage[timestamp] = obj;
	},
	_store : function(obj, timestamp){
	    console.log("to remotestorage")
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
	    return rsGeotracks.get(this.name).then(function(mp){
		console.log(JSON.stringify(mp))
	    })
	},
	publish : function(){
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
	})
    })
    return geotracker;
})
