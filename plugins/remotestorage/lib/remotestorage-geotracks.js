define([
    './remotestorage'
], function(remoteStorage){
    
    
    remoteStorage.defineModule('geotracks', function(priv, pub){
	priv.declareType('geotrackNode', {
	    type : 'object',
	    properties : {
		latitude : {
		    type : 'number',
		    required : 'true'
		},
		longitude : {
		    type : 'number',
		    required : 'true'
		},
		altitude : {
		    type : 'number'
		},
		accuracy : {
		    type : 'number'
		},
		altitudeAccuracy : {
		    type : 'number'
		},
		heading : {
		    type : 'number'
		},
		speed : {
		    type : 'number'
		}
	    }
	})
	var optionals = ['altitude', 'accuracy', 'altitudeAccuracy', 'heading', 'speed'];
	var current_track = 'me';
	var multipoint = function(coordinates,time, altitude, accuracy, altitudeAccuracy, heading, speed ) {
	    return { "type": "Feature",
		     "geometry": {
			 "type": "MultiPoint",
			 "coordinates": coordinates ? coordinates : []
		     },
		     "properties" : {
			 "timestamp" : time ? time : [],
			 "speed" : speed ? speed : [],
			 "altitude" : altitude ? altitude : [],
			 "heading" : heading ? heading : [],
			 "altitudeAccuracy" : altitudeAccuracy ? altitudeAccuracy : [],
			 "accuracy" : accuracy ? accuracy : [],
			 "raw" : []
		     },
		     "bbox" : []
		   }
	}
	return { exports : {
	    setTrack : function(name){
		if(typeof name === 'string' || ( typeof name == 'object' && name instanceof String ) ) {
		    current_track = name;
		    return name;
		} else {
		    return false;
		}
	    },
	    get : function(name){
		if(!name)
		    name = current_track;
		return priv.getAll(name+'/').then( function(listing){
		    var coordinates = [];
		    var altitudes = []
		    var accuracys = []
		    var altitudeAccuracys = []
		    var headings = []
		    var speeds = []

		    var time =  Object.keys(listing).sort();
		    time.forEach(function(t, i){
			var o = listing[t];
			time[i] = parseInt(t); // tweak the current time (timestamps become strings in the listings)
			//default values for not required fields
			optionals.forEach(function(attr){
			    var val = o[attr];
			    if(!val)
				o[attr] = 0;
			})
			coordinates.push([o.latitude, o.longitude]);
			speeds.push(o.speed);
			altitudes.push(o.altitude);
			headings.push(o.heading);
			altitudeAccuracys.push(o.altitudeAccuracy);
			accuracys.push(o.accuracy);
		    })
		    var mp = multipoint(coordinates, time, altitudes, accuracys, altitudeAccuracys, headings, speeds)
		    return mp;
		    //handle raw and bbox
		}
		    
		)
	    },
	    store : function(obj, timestamp, name){
		if(!timestamp)
		    timestamp = (new Date).getTime();
		if(!name)
		    name = current_track;
		//console.log('storing ', obj, timestamp, name);
		return priv.storeObject('geotrackNode', name+'/'+timestamp, obj)
	    },
	    publish : function(name){
		return this.get(name).then(function(mp){
		    return pub.storeFile('application/json', name, JSON.stringify(mp)).then(function(){
			return pub.getItemURL(name);
		    })
		})
	    }
	    
	} }
    })
    return remoteStorage.geotracks
})
