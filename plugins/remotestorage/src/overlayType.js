define([
  'underscore',
  '../lib/remotestorage-locations'
], function(_, locations) {

  return {
    name: "Remote Storage (public)",
    writable: true,
    category: 'public',

    listCollections: function(callback) {
      locations.listCollections().then(function(collections) {
        callback(collections.map(function(name) {
          return { name: name };
        }));
      });
    },

    getCollection: function(name, callback) {
      locations.getCollection(name).then(function(col) {
        _.extend(col, { name: name, type: 'RemoteStorage' });
        callback(col);
      });
    }

  };

});
