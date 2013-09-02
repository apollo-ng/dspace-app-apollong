define([
  './src/geofeed',
  './src/overlay'
], function(SpaceApiFeed, SpaceApiOverlay) {

  dspace.plugin('spaceapi', {
    name: 'SpaceAPI',
    description: 'show information about spaces (currently hackerspaces) using http://spaceapi.net',
    authors: ['☮ elf Pavlik ☮ <perpetual-tripper@wwelves.org>'],
    version: '0.1',

    hooks: {
      load: function(dspace) {
        dspace.world.addFeedType('SpaceAPI', SpaceApiFeed);
        dspace.ui.overlayManager.registerType(SpaceApiOverlay);
      }
    }
  });
});
