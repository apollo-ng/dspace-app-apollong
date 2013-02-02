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
      this.title = this.makeTitle();
    },

    updateCollection: function(collection) {
      // FIXME: don't use "reset", but "update"
      // http://backbonejs.org/#Collection-update
      this.collection.update(collection.features);
    },

    makeTitle: function() {
      return this.name;
    }

  });

  return Base;

});
