
define([
  './src/settingsModal',
  './src/geofeed',
  './src/overlayType'
], function(SettingsModal, RemoteStorageFeed, OverlayType) {

  dspace.plugin('remotestorage', {
    name: 'remotestorage',
    description: 'Load and save features and feature collections from your remotestorage',
    authors: ['Niklas E. Cathor <nilclass@riseup.net>'],
    version: '0.1',

    hooks: {

      style: 'plugins/remotestorage/assets/style.css',

      load: function(world) {
        world.addFeedType('RemoteStorage', RemoteStorageFeed);

        dspace.ui.overlayManager.registerType(OverlayType);
      },

      widgetBarIcon: {
        src: 'plugins/remotestorage/assets/remoteStorageIcon.svg',
        modal: SettingsModal,
        classNames: 'remotestorage-icon'
      }
    }
  });

});
