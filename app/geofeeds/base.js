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

      this.collection.on('add', function() {
        this.trigger('change', this);
      }.bind(this));

      this.collection.on('reset', function() {
        this.trigger('change', this);
      }.bind(this));
    },

    updateCollection: function(collection, reset) {
      if(reset) {
        this.collection.reset([]);
      }
      this.collection.update(collection.features);
    },

    makeTitle: function() {
      return this.name;
    },

    /**
     * Method: watch
     * stub. to be overwritten by subclasses.
     */
    watch: function() {}

  });

  return Base;

});
