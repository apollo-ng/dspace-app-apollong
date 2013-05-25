define([
  'reqwest',
  'models/feature',
  './base'
], function(Reqwest, Feature, Base) {

  "use strict";

  /**
   * Class: GeoFeeds.GPXRoute
   *
   */

  return Base.extend({

    type: 'GPXRoute',

    initFeed: function() {
      this.__defineGetter('routeUrl', function() {
        
      });
    },

    watch: function(options) {
      this.fetch();
    },

    fetch: function() {
      new Reqwest({
        url: this.routeUrl,
        type: 'xml',
        success: this._receiveRoute.bind(this),
        failure: function(e) {
          console.error("Failed to fetch GPX route: ", e);
        }
      });

      new Reqwest({
        url: this.trackUrl,
        type: 'xml',
        success: this._receiveTrack.bind(this),
        failure: function(e) {
          console.error("Failed to fetch GPX track: ", e);
        }
      });
    },

    _receiveTrack: function(source) {
      this.trackFeatures = Feature.fromGPXTrack(source)
      this._received();
    },

    _receiveRoute: function(source) {
      this.routeFeatures = Feature.fromGPXRoute(source);
      this._received();
    },

    _received: function() {
      if(this.routeFeatures && this.trackFeatures) {
        this.collection.track = this.trackFeatures;
        this.updateCollection(this.routeFeatures, true);
        delete this.routeFeatures;
        delete this.trackFeatures;
      }
    }

    
  });

});