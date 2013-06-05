define([
  './remotestorage'
], function(remoteStorage) {

  remoteStorage.defineModule('locations', function(privClient, pubClient) {

    // pubClient.declareType('feature', {
    //   "name": "feature",
    //   "type": "object",
    //   "properties": {
    //     "type": {
    //       "type": "string",
    //       "description": "GeoJSON type, for features always 'Feature'",
    //       "required": true,
    //       "pattern": "^Feature$"
    //     },
    //     "geometry": {
    //       "type": "object",
    //       "description": "A GeoJSON Geometry object",
    //       "required": true,
    //       "properties": {
    //         "type": {
    //           "type": "string",
    //           "required": true,
    //           "enum": ["Point", "MultiPoint", "LineString", "MultiLineString",
    //                    "Polygon", "MultiPolygon"]
    //         },
    //         "coordinates": {
    //           "type": "array",
    //           "description": "Coordinates of this Geometry. Format varies with type.",
    //           "required": true,
    //           "items": {
    //             "type": ["number", "array"]
    //           }
    //         }
    //       }
    //     },
    //     "properties": {
    //       "type": "object",
    //       "description": "Opaque object of properties associated with this Feature.",
    //       "required": true
    //     },
    //     "crs": {
    //       "type": "object",
    //       "description": "Coordinate System Reference",
    //       "properties": {
    //         "type": {
    //           "type": "string",
    //           "required": true,
    //           "enum": ["name", "link"]
    //         },
    //         "properties": {
    //           "type": "object",
    //           "required": true
    //         }
    //       }
    //     },
    //     "bbox": {
    //       "type": "array",
    //       "description": "Bounding box that contains this feature",
    //       "minItems": 4,
    //       "maxItems": 4,
    //       "items": {
    //         "type": "number"
    //       }
    //     }
    //   }
    // }


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
          return pubClient.getObject('collections/' + encodeURIComponent(name)).
            then(function(collection) {
              if(! collection) {
                collection = { name: name, features: [], type: 'FeatureCollection' };
              }

              function reload() {
                return pubClient.getObject('collections/' + encodeURIComponent(name)).
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

                save: function(callback) {
                  var col = remoteStorage.util.extend({}, collection);
                  col.features = collection.features.map(function(feature) {
                    return feature.id;
                  });
                  pubClient.storeObject('collection', 'collections/' + encodeURIComponent(name), col).
                    then(callback);
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
