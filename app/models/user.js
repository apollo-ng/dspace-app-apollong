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
	    var options = {
	      interval: 2300,
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

      if( geoLocation && typeof geoLocation.coords == 'object' ) {
        this.set({ geoLocation: geoLocation });
        repeat = true;
      }

      var self = this;
      setTimeout( 
	      function( ) { self.watchPosition( options ) },
	      options.interval );
    },
    watchPosition: function( options ) {
      var self = this;
      var watch = navigator.geolocation.watchPosition( 
        // success
        function( geoLocation ) {
          if( geoLocation.coords.accuracy > options.minacc
	            && geoLocation.coords.accuracy < options.maxacc ) {
		        navigator.geolocation.clearWatch( self.watch );
		        self.updatePosition( geoLocation ); }
        }, 
        // error 
        function( e ) {
          self.fixme( 'geolocation', e ); 
          navigator.geolocation.clearWatch( self.watch );
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
    fixme: function( e ) {
      tag = 'geolocation';
      console.log( '#FIXME('+tag+'): '+e.message );
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
