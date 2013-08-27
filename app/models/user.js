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

    getStatusData: function() {
      data = {}
      geoJSON = this.feed.avatar.toJSON();
      data.uuid = geoJSON.id;
      data.lat = geoJSON.geometry.coordinates[1];
      data.lon = geoJSON.geometry.coordinates[0];
      var position = this.feed.position;
      if(position){
        data.accuracy = position.coords.accuracy;
        data.timestamp = position.timestamp;
        if(position.coords.speed) data.speed = position.coords.speed;
      }
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
