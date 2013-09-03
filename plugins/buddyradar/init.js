define([
  './src/buddyradarFeed',
  './src/personaAuth'
], function(BuddyradarFeed, PersonaAuth) {

  var auth;

  dspace.plugin('buddyradar', {
    name: 'Buddyradar',
    description: "Show buddies on the map. Something like that.",
    version: '0.1',
    authors: [' ☮ elf Pavlik ☮ <perpetual-tripper@wwelves.org>' ],

    hooks: {
      load: function(dspace) {
        // init feed
        dspace.world.buddyFeed = new BuddyradarFeed({
          url: dspace.world.config.user.buddyradarURL + '/faye',
          chan: dspace.world.config.user.buddyradarChannel,
          userId: dspace.world.user.feed.avatar.id,
          nickname: dspace.world.user.get('nickname'),
          visible: true
        });
        auth = new PersonaAuth(dspace.world.config.user.buddyradarURL + '/auth');
        dspace.world.buddyFeed.watch();

        // hook up to user location
        dspace.world.user.on('location-changed', function() {
          this.buddyFeed.publish(this.user.getStatusData());
        }.bind(dspace.world));

        // add to map
        var map = dspace.ui.map;
        map.buddyLayer = map.addOverlay( dspace.world.buddyFeed );
        dspace.world.buddyFeed.collection.on('change', function( e ){
          map.buddyLayer.render();
        });
      },

      widgetBarIcon: {
        src: 'plugins/buddyradar/assets/persona.png',
        action: function() {
          auth.login();
        }
      }
    }
  });

});
