define([], function() {

  return {
    name: "SpaceApi",
    writable: false,
    category: 'public',

    listCollections: function(callback) {
      var feedConfig = dspace.world.config.user.feeds.spaceAPI;
      callback([feedConfig]);
    },

    //FIXME: support for multiple feeds
    getCollection: function(name, callback) {
      callback(dspace.world.config.user.feeds.spaceAPI);
    },
  };
});
