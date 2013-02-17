define([
  './base'
], function(BaseFeed) {

  /**
   * Class: GeoFeeds.Device
   *
   * Feed watching the geolocation API of the browser.
   * It's 'collection' will only ever contain one feature.
   *
   * Expects an avatar feature to be passed as option "avatar" to
   * the initializer.
   *
   */
  return BaseFeed.extend({

    name: 'device',
    type: 'Device',
    position: {},


    /**
     *  Method: watch
     *
     *  initiates the geolocation API watcher process
     */
    watch: function() {
      if (navigator.geolocation) {
        // Browser has geolocation API - enable Watcher
        this.watchID = navigator.geolocation.watchPosition(

          // successFunction
          function(position) {
            this.avatar.setLatLon(position.coords.latitude, position.coords.longitude);
            if(this.collection.length === 0) {
              this.collection.add(this.avatar);
            }
            this.position = position;
          }.bind(this),

          // errorFunction
          function(error) {
            switch(error.code) {
              // PERMISSION_DENIED
              case 1:
                console.log('User denied the request for Geolocation.');
              break;
              // POSITION_UNAVAILABLE
              case 2:
                console.log('Location information is unavailable.');
              break;
              // TIMEOUT
              case 3:
                console.log('The request to get user location timed out.');
              break;
              // Unkown Error
              default:
                console.log('An unknown error occurred.');
              break;
            }
            // set user marker to mapcenter as a fallback
            /* FIXME: this.world.user.feed.avatar.setLatLon(48, 11); */
            // make sure watcher is disabled
            this.world.user.feed.unwatch();
          },
          // Geolocation API Settings
          // FIXME: should be coming from the user model
          {
             enableHighAccuracy: true,
             maximumAge: 86400,
             timeout: 1000 //in ms
          }
        );
      } else {
        // This browser has no geolocation API
        // set user marker to mapcenter as a fallback
        /* FIXME: this.world.user.feed.avatar.setLatLon(48, 11); */
      }
    },

    /**
     *  Method: unwatch
     *
     *  clears the geolocation API watcher process
     */
    unwatch: function() {
      navigator.geolocation.clearWatch(this.watchID);
    },

  });

});
