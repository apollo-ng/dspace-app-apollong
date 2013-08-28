define([
  'underscore',
  'backbone',
  'backbone-localstorage',
  'geofeeds/device',
  'models/feature'
], function(_, Backbone, backboneLocalStorage, DeviceFeed, Feature) {
  /**
   * Add basic user model
   */
  // Class: User
  var User = Backbone.Model.extend({

    // Method: initialize
    initialize: function() {
      backboneLocalStorage.setup(this, 'users');

      this.setDefaults(this.get('config'));

      this.feed = new DeviceFeed({
        avatar: new Feature({
          properties: {
            type: 'avatar'
          }
        })
      });
      this.feed.set('visible', true);

      var prevLatLon;

      this.feed.avatar.on('position-changed', function(latlon) {
        if(prevLatLon && prevLatLon.lat === latlon.lat && prevLatLon.lon === latlon.lon) {
          return;
        }
        prevLatLon = latlon;
        this.trigger('location-changed', latlon);
        this.feed.trigger('change');
      }.bind(this));

      this.feed.watch();
    },

    getLocation: function() {
      return this.feed.avatar.getLatLon();
    },

    setLocation: function(lat, lon) {
      this.feed.avatar.setLatLon(lat, lon);
    },

    setDefaults: function(defaults) {
      for(var key in defaults) {
        if(! this.get(key)) {
          this.set(key, defaults[key]);
        }
      }
    },

    /*
     *
     * position seams like a special object
     * one can't copy it by data.position = this.feed.position
     *
     */
    getStatusData: function() {
      data = { position: {} }
      data.uuid = this.feed.avatar.id;
      var position = this.feed.position;
      data.position.timestamp = position.timestamp
      data.position.coords = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy
      }
      // FIXME: extract into method since duplicated in <BayeuxFeed>
      var optional = ["altitude", "altitudeAccuracy", "heading", "speed"]
      for(var i=0;i<optional.length;i++){
        var key = optional[i];
        if(position.coords[key]) data.position.coords[key] = position.coords[key]
      };
      return data;
    }

  });

  /**
   * Function: User.first
   *
   * Fetches attributes for the first <User> instance from
   * localStorage and creates a new <User>, if it finds any.
   *
   * Returns:
   *   A <User> instance or undefined.
   */
  User.first = function() {
    var attrs = backboneLocalStorage.get('users').findAll()[0];
    if(attrs) {
      return new User(attrs);
    }
  };

  return User;
});
