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

      this.feed = new DeviceFeed({
        avatar: new Feature({
          properties: {
            type: 'avatar'
          }
        })
      });
      this.feed.set('visible', true);

      this.feed.avatar.on('position-changed', function(latlon) {
        this.trigger('location-changed', latlon);
        this.feed.trigger('change');
      }.bind(this));

      this.feed.watch();
    }, 

    getLocation: function() {
      return this.feed.avatar.getLatLon();
    },

    setDefaults: function(defaults) {
      for(var key in defaults) {
        if(! this.get(key)) {
          this.set(key, defaults[key]);
        }
      }
    },

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
