define([
  'underscore',
  'backbone',
  'collections/feature'
], function(_, Backbone, FeatureCollection) {


  /**
   * Class: GeoFeeds.Base
   *
   */

  var Base = Backbone.Model.extend({

    initialize: function(options) {
      this.collection = new FeatureCollection();
      _.extend(this, options);
    },

    updateCollection: function(collection) {
      // FIXME: don't use "reset", but "update"
      // http://backbonejs.org/#Collection-update
      this.collection.reset(collection.features);
    }

  });

  return Base;

});
