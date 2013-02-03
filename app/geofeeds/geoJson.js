define([
  'underscore',
  'reqwest',
  './base',
], function(_, Reqwest, Base) {

  "use strict";

  /**
   * Class: GeoFeeds.GeoJSON
   *
   */

  // Constant: DEFAULT_WATCH_INTERVAL
  //
  var DEFAULT_WATCH_INTERVAL = 300; // seconds

  return Base.extend({

    /**
     * Method: watch
     *
     * Periodically updates associated geoJSON resource.
     *
     * Options:
     *   
     */
    watch: function(options) {
      options = _.extend({
        interval: DEFAULT_WATCH_INTERVAL
      }, options);
      setInterval(this.fetch.bind(this), options.interval * 1000);
      this.fetch();
    },

    fetch: function() {
      var request = new Reqwest({
        url: this.url,
        type: 'json',
        success: function( response ) {
          this.updateCollection(response);
        }.bind(this),
        failure: function( e ) {
          alert( '#FIXME' ); }
      });
    },

    makeTitle: function() {
      return 'CORS: ' + this.name;
    }

  });

});