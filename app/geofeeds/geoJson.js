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

    type: 'GeoJSON',

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
        success: function( collection ) {
          this.updateCollection(collection, true);
        }.bind(this),
        failure: function( e ) {
          alert( '#FIXME' ); }
      });
    }

  });

});