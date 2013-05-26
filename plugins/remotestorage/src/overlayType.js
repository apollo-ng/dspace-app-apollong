define(['../lib/remotestorage-locations'], function(locations) {

  return {
    name: "Remote Storage (public)",
    writable: true,
    category: 'public',

    listCollections: function(callback) {
      locations.listCollections().then(function(collections) {
        callback(collections.map(function(name) {
          return {
            name: name,
            type: 'RemoteStorage'
          };
        }));
      });
    }

  };

});
