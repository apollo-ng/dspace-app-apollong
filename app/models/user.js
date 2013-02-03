define([
  'underscore',
  'backbone',
  'backbone-localstorage'
], function(_, Backbone, backboneLocalStorage) {
  /**
   * Add basic user model
   */
  // Class: User
  var User = Backbone.Model.extend({

    // Method: initialize
    initialize: function() {
      backboneLocalStorage.setup(this, 'users');
    }, 
    setDefaults: function(defaults) {
      for(var key in defaults) {
        if(! this.get(key)) {
          this.set(key, defaults[key]);
        }
      }
    },

    /**
     * get browser geolocation object
     * set user geoLocation 
     */
    updatePosition: function( geoLocation, defaults ) {
      if( geoLocation && typeof geoLocation.coords == 'object' ) {
        this.set({ geoLocation: geoLocation });
        repeat = true;
      }

    },
    watchPosition: function( defaults ) {
	    var options = {
	      minacc: 49,
	      maxacc: 1001,
	      highacc: 'true',
	      maxage: 600000, // used cached locations 
	      timeout: 600
	    };
      for(var key in this.get('geoLocationOptions')) {
        if(! options[key]) {
          options[key] = defaults[key];
        }
      }

      var self = this;
      var watch = navigator.geolocation.watchPosition( 
        // success
        function( geoLocation ) {
		      self.updatePosition( geoLocation );
        }, 
        // error 
        function( e ) {
          self.fixme( 'geolocation', e ); 
          self.updatePosition( false );
        },
        // geolocation API options 
        { enableHighAccuracy : options.highacc,
          minAccuracy: true,
          maximumAge: options.maxage,
          timeout: options.timeout } );
    },


    /**
     * error handler
     */
    fixme: function( tag, e ) {
      console.log( '#FIXME('+tag+'): '+(e.message||e) );
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
