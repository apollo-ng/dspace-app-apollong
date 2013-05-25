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
      _.extend(this, options);
      this.setCollection(new FeatureCollection());
      this.title = this.makeTitle();

      if(typeof(this.initFeed) === 'function') {
        this.initFeed();
      }
    },

    setCollection: function(collection) {
      if(this.collection) {
        this.stopListening(this.collection);
      }

      this.collection = collection;
      this.collection.feed = this;
      this.listenTo(this.collection, 'add', function() {
        this.trigger('change', this);
      }.bind(this));

      this.listenTo(this.collection, 'reset', function() {
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
