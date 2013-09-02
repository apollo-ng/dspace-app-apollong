
define([
  './src/settingsModal',
  './src/geofeed',
  './src/geotrack',
  './src/overlayType'
], function(SettingsModal, RemoteStorageFeed, RemoteStorageGeotracker, OverlayType) {

  dspace.plugin('remotestorage', {
    name: 'remotestorage',
    description: 'Load and save features and feature collections from your remotestorage',
    authors: ['Niklas E. Cathor <nilclass@riseup.net>'],
    version: '0.1',

    hooks: {

      style: 'plugins/remotestorage/assets/style.css',

      load: function(dspace) {

        //GeoTracker
        // uses geotrackers and profile module
	      dspace.geotracker =  RemoteStorageGeotracker;
	      function trackit(){
	        var status = dspace.world.user.getStatusData()
	        dspace.geotracker.store(status.position.coords, status.position.timestamp);
	      }
	      dspace.world.user.on('location-changed', trackit);
	      trackit(); // initiali there is no location-changed event so we store the current location first

        //RemoteStorage collections as feeds
        // uses locations
	      dspace.world.addFeedType('RemoteStorage', RemoteStorageFeed);

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
