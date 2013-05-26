
define([
  './src/settingsModal',
  './src/geofeed',
  './src/browseWidget'
], function(SettingsModal, RemoteStorageFeed, BrowseWidget) {

  dspace.plugin('remotestorage', {
    name: 'remotestorage',
    desc: 'Load and save features and feature collections from your remotestorage',
    authors: ['Niklas E. Cathor <nilclass@riseup.net>'],
    version: '0.1',

    hooks: {

      style: 'plugins/remotestorage/assets/style.css',

      load: function(world) {
        world.addFeedType('RemoteStorage', RemoteStorageFeed);

        dspace.ui.overlayManager.addSection(
          "Remote Storage",
          BrowseWidget,
          'private'
        );
      },

      widgetBarIcon: {
        src: 'plugins/remotestorage/assets/remoteStorageIcon.svg',
        modal: SettingsModal,
        classNames: 'remotestorage-icon'
      }
    }
  });

});
