define([
    './remotestorage'
], function(remoteStorage) {
    remoteStorage.defineModule('profile', function(privateClient, publicClient){
	publicClient.declareType('profile', {
	    'type' : 'object',
	    'properties' : {
		'name' : {
		    'type' : 'string'
		},
		'screenname' : {
		    'type' : 'string'
		},
		'homepage' : {
		    'type' : 'string',
		},
		'profile_image_url': {
		    'type' : 'string'
		},
		'location' :{
		    'type' : 'string'
		},
		'description'  : {
		    'type' : 'string'
		}
	    },
	})
	var keys =  ['name', 'screenname', 'homepage', 'profile_image_url', 'location', 'description']//Object.keys(publicClient.schemas[Object.keys(publicClient.schemas)[0]].properties);
	return {
	    'exports' : {
		'keys' : keys,  
		
		'save' : function(data){
		    publicClient.getObject('me').then( 
			function(old_data){
			    if(old_data){
				keys.forEach( function(k){
				    if(typeof(data[k]) === 'undefined')
					data[k] = old_data[k]
				})
			    }
			    return publicClient.storeObject('profile', 'me',data);
			})	  
		},
		'template' : function(){
		    return publicClient.getFile('template');
		},
		'load' : function(){
		    return publicClient.getObject('me');
		},
		/*'deploy' : function(){
		  publicClient.getObject('me').then( function(me){
		  var page = ""
		  publicClient.getFile('template').then( function(template){
		  var page = template.data ;
		  Object.keys(me).forEach( function(k) {
		  page = page.replace( new RegExp('(\\$'+key+')'), me[key] )
		  })
		  })
		  return remoteStorage.www.up('profile.html', 
		  'text/html', 
		  page)
		  })
		  },
		  'link' : function(){
		  return publicClient.getItemURL('profile.html');
		  },*/
		'onchange' : function(callback){
		    return publicClient.on('change', callback);
		}    
	    }
	}
    })

    return remoteStorage.profile;

})
   
