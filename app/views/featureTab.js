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
    },

    /*
     * FIXME doplicates <FeatureCollection.toJSON>
     * FIXME can leak session state to collection
     */
    render: function(){
      var self = this;
      this.$el.empty();

      this.$el.attr('data-index', this.index);

      _(this.collection.models).each(function(feature, featureIndex){
        feature.set( 'index', featureIndex );
        var featureBoxItem = new FeatureBoxItem({
          model: feature,
          aether: self.aether
        });

        var renderedTemplate = featureBoxItem.render();
        self.$el.append(renderedTemplate);

      });
      return self.el;
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
