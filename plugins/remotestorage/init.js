
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
        world.addFeedType('remoteStorage', RemoteStorageFeed);

        dspace.ui.overlayManager.addSection(
          "Remote Storage",
          BrowseWidget,
          'omc_private' //FIXME!
        );
      },

      widgetBarIcon: {
        src: 'assets/images/remoteStorageIcon.svg',
        modal: SettingsModal,
        classNames: 'remotestorage-icon'
      }
    }
  });

});
