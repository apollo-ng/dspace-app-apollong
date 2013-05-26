
define(['./settingsModal'], function(SettingsModal) {

  dspace.plugin({
    name: 'remotestorage',
    desc: 'Load and save features and feature collections from your remotestorage',
    authors: ['Niklas E. Cathor <nilclass@riseup.net>'],
    version: '0.1',

    hooks: {
      widgetBarIcon: {
        src: 'assets/images/remoteStorageIcon.svg',
        modal: SettingsModal
      }
    }
  });

});
