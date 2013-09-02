
define(['./src/gpxRouteFeed'], function(GPXRouteFeed) {

  var routinoURL;

  dspace.plugin('navigation', {
    name: "Navigation",
    description: "Route calculation & navigation, powered by a routino backend",
    version: '0.1',
    authors: ['Niklas E. Cathor <nilclass@riseup.net>'],

    hooks: {
      load: function(dspace) {
        routinoURL = dspace.world.config.user.routinoURL;
        if(typeof(routinoURL) !== 'string') {
          throw new Error(
            "Expected configuration option 'user.routinoURL' to be set!"
          );
        }
        dspace.world.addFeedType('GPXRoute', GPXRouteFeed);
      },

      mapCommands: {
        'navigate-here': function(point, location) {
          dspace.world.addFeed(dspace.world.createFeed({
            type: 'GPXRoute',
            from: dspace.world.user.feed.avatar.getLatLon(),
            to: location,
            url: routinoURL
          }, true));
        }
      },

      mapContextItems: {
        'navigate-here': "Navigate here"
      }
    }
  });

});
