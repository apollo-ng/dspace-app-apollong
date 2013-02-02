define([
  'backbone',
  'views/featureBoxItem'
], function(Backbone, FeatureBoxItem) {

  /**
   * Class: FeatureTab
   *
   * bundles all <Feature>s from a <FeatureCollection> for <FeatureBox>
   *
   * Receives:
   *
   *   collection - a <FeatureCollection>
   *   aether - event aggregator from <World>
   */
  var FeatureTab = Backbone.View.extend({

    className: 'featureTab',

    initialize: function(){
      var self = this;

      /**
       * Property: aether
       *
       * event aggregator from <World>
       */
      this.aether = this.options.aether;

      this.feed = this.options.feed;
      this.collection = this.feed.collection;

      /**
       * Event: collection:reset
       *
       * listens on collection for *reset* events and renders itself
       */
      this.collection.on( 'reset', function(){
        self.render( );
      });

      /**
       * Event: feature:current
       *
       * listens on collection for *feature:current* events
       * then trigger them on ether passing forward future
       */
      this.collection.on( 'feature:current', function( feature ){
        self.aether.trigger('feature:current', feature );
      });

      this.collection.on('add', function(feature) {
        this.renderFeature(feature);
      }.bind(this));
    },

    /*
     * FIXME doplicates <FeatureCollection.toJSON>
     * FIXME can leak session state to collection
     */
    render: function(){
      if(this.rendered) {
        return;
      }
      console.log('render featureTab', this.index);
      this.$el.empty();

      this.rendered = true;

      this.$el.attr('data-index', this.index);

      this.featureIndexCounter = 0;

      return this.el;
    },

    renderFeature: function(feature) {
      this.render();
      var featureIndex = this.featureIndexCounter++;
      console.log('render feature in featureTab', featureIndex, this.index, feature);
      feature.set( 'index', featureIndex );
      var featureBoxItem = new FeatureBoxItem({
        model: feature,
        aether: this.aether
      });
      var renderedTemplate = featureBoxItem.render();
      this.$el.append(renderedTemplate);
    },

    hide: function() {
      this.$el.hide();
    },

    show: function() {
      this.$el.show();
    }

  });

  return FeatureTab;
});
