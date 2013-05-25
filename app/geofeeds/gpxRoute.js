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

    watch: function(options) {
      this.fetch();
    },

    fetch: function() {
      new Reqwest({
        url: this.url,
        type: 'xml',
        success: function(source) {
          this.updateCollection({
            features: Feature.fromGPXTrack(source)
          }, true);
        }.bind(this),
        failure: function(e) {
          console.error("Failed to fetch GPX route: ", e);
        }
      });
    }
    
  });

});