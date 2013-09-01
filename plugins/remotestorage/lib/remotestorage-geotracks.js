define([
    'remotestorage'
], function(remoteStorage){
    
    
    remoteStorage.defineModule('geotracks', function(pub, priv){
	priv.declareType('geotrackNode', {
	    type : 'object',
	    prperties : {
		coordinates : {
		    type : 'array'
		    minItems : 2,
		    maxItems : 2,
		    required : true;
		    items : { 
			type : 'number'
		    }
		},
		speed : {
		    type : 'array'
		},
		altitude : {
		    type : 'array'
		},
		heading : {
		    type : 'array'
		},
		horizontal_accuracy : {
		    type : 'array'
		},
		vertical_accuracy : {
		    type : 'array'
		}
	    }
	})
	var current_track = 'me'
	var multipoint = function(coordinates,time, speed, altitude, heading, horizontal_accuracy, vertical_accuracy) {
	    return { "type": "Feature",
		     "geometry": {
			 "type": "MultiPoint",
			 "coordinates": coordinates ? coordinates : []
		     },
		     "properties" : {
			 "time" : time ? time : [],
			 "speed" : speed ? speed : [],
			 "altitude" : altitude ? altitude : [],
			 "heading" : heading ? heading : [],
			 "horizontal_accuracy" : horizontal_accuracy ? horizontal_accuracy : [],
			 "vertical_accuracy" : vertical_accuracy ? vertical_accuracy : [],
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
		return priv.getAll(name).then( function(lisitng){
		    var coordinates = [];
		    var speed = [];
		    var heading = [];
		    var horizontal_accuracy = [];
		    var vertical_accuracy = [];
		    var time =  Object.keys(listing).sort();
		    time.forEach(function(t){
			var o = listing[t];
			//default values for not required fields
			o.speed = o.speed ? o.speed : 0;
			o.altitude = o.altitude ? o.altitude : 0;
			o.heading = o.heading ? o.heading : 0;
			o.horizontal_accuracy = o.horizontal_accuracy ? o.horizontal_accuracy : 0;
			o.vertical_accuracy = o.vertical_accuracy ? o.vertical_accuracy : 0;
			
			coordinates.push(o.coordinates);
			speed.push(o.speed);
			altitude.push(o.altitude);
			heading.push(o.heading);
			horizontal_accuracy.push(o.horizontal_accuracy);
			vertical_accuracy.push(o.vertical_accuracy);
		    })
		    var mp = multipoint(coordinates,time, speed, altitude, heading, horizontal_accuracy, vertical_accuracy)
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
		return priv.storeObject('geotrackNode', name+'/'+timestamp, obj)
	    }
	    
	    
	} }
    })
    return remoteStorage.geotracks
})
