define([
  'remoteStorage'
], function(remoteStorage) {

  remoteStorage.defineModule('locations', function(privClient, pubClient) {

    var watchers = {};

    return {
      exports: {

        init: function() {
          privClient.release('');
          pubClient.release('');

          privClient.on('change', function(event) {
            var parts = event.path.split('/');
            var collectionPath = parts.slice(0, -1).join('/');
            console.log('try watchers for', collectionPath);
            var w = watchers[collectionPath];
            if(w) {
              var action = event.newValue && event.oldValue ? 'update' : (event.newValue ? 'add' : 'remove');
              var value = event.newValue || event.oldValue;
              w.forEach(function(watcher) {
                watcher(action, value);
              });
            }
          });
        },

        watchCollection: function(name, callback) {
          if(! watchers[name]) {
            watchers[name] = [];
          }
          watchers[name].push(callback);
          var path = name + '/';
          privClient.use(path);
          privClient.getAll(path).then(function(features) {
            for(var id in features) {
              callback('add', features[id]);
            }
          });
        }

      }
    };
    
  });

  return remoteStorage.locations;

});