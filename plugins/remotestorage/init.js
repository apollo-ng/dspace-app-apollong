
define([
  './src/settingsModal',
  './src/geofeed'
], function(SettingsModal, RemoteStorageFeed) {

  dspace.plugin('remotestorage', {
    name: 'remotestorage',
    desc: 'Load and save features and feature collections from your remotestorage',
    authors: ['Niklas E. Cathor <nilclass@riseup.net>'],
    version: '0.1',

    hooks: {

      load: function(world) {
        world.addFeedType('remoteStorage', RemoteStorageFeed);
      },

      widgetBarIcon: {
        src: 'assets/images/remoteStorageIcon.svg',
        modal: SettingsModal
      }
    }
  });

});
