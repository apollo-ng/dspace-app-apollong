define([
  './base'
], function(BaseFeed) {

  /**
   * Class: DeviceFeed
   *
   * Feed watching the device's location.
   * It's 'collection' will only ever contain one feature.
   *
   * Expects an avatar feature to be passed as option "avatar" to
   * the initializer.
   *
   */
  return BaseFeed.extend({

    watch: function() {
      navigator.geolocation.watchPosition(function(position) {
        console.log('position changed', position);
        if(this.collection.length === 0) {
          this.collection.add(this.avatar);
        }
        this.avatar.setLatLon(position.coords.latitude, position.coords.longitude);
      }.bind(this));
    }

  });

});