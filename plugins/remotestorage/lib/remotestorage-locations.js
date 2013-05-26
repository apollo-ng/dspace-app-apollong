define([
  './remotestorage'
], function(remoteStorage) {

  remoteStorage.defineModule('locations', function(privClient, pubClient) {

    var watchers = {};

    return {
      exports: {

        init: function() {
          privClient.release('');
          pubClient.release('');

          pubClient.use('collections/');
          pubClient.use('features/', true);
        },

        listCollections: function() {
          return pubClient.getListing('collections/');
        },

        getCollection: function(name) {
          return pubClient.getObject('collections/' + name).
            then(function(collection) {
              if(! collection) {
                collection = { name: name, features: [], type: 'FeatureCollection' };
              }

              function reload() {
                return pubClient.getObject('collections/' + name).
                  then(function(c) {
                    if(typeof(c) === 'object') {
                      collection = c;
                    }
                  });
              }

              if(! watchers[name]) {
                watchers[name] = [];
              }
              return {
                getFeatures: function() {
                  return reload().then(function() {
                    return remoteStorage.util.
                      asyncMap(collection.features, function(feature) {
                        // features are expected to be objects, ...
                        if(typeof(feature) === 'object') {
                          return feature;
                        } else {
                          // ... or relative paths to the actual features.
                          return pubClient.getObject(feature);
                        }
                      });
                  });
                },

                addFeature: function(feature) {
                  if(! feature.id) {
                    throw "Feature requires an ID";
                  }
                  var path = 'features/' + feature.id
                  for(var i in collection.features) {
                    if(collection.features[i] === path) {
                      // already have this feature!
                      return;
                    }
                  }
                  return reload().then(function() {
                    return pubClient.storeObject('feature', path, feature);
                  }).
                    then(function() {
                      collection.features.push(path);
                      return pubClient.storeObject(
                        'collection', 'collections/' + name, collection
                      );
                    }).
                    then(function() {
                      console.log('added feature', feature);
                      watchers[name].forEach(function(watcher) {
                        watcher('add', feature);
                      });
                    });
                },

                watch: function(callback) {
                  watchers[name].push(callback);
                }
              };
            });
        }

      }
    };
    
  });

  return remoteStorage.locations;

});
