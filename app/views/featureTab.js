define([
  'backbone',
  'views/featureBoxItem'
], function(Backbone, FeatureBoxItem) {

  /**
   * Class: FeatureTab
   *
   * bundles all <Feature>s from a <FeatureCollection> for <FeatureBox>
   */
  var FeatureTab = Backbone.View.extend({

    className: 'featureTab',

    initialize: function(){
      var self = this;

      this.aether = this.options.aether;

      //FIXME this.aether = this.options.aether;
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

      return this;
    },

    /*
     * FIXME doplicates <FeatureCollection.toJSON>
     * FIXME can leak session state to collection
     */
    render: function(){
      var self = this;
      this.$el.empty();

      _(this.collection.models).each(function(feature, index){
        feature.set( 'index', index );
        var featureBoxItem = new FeatureBoxItem({
            model: feature
        });

        var renderedTemplate = featureBoxItem.render();
        self.$el.append(renderedTemplate);

      });
      return self.el;
    },

  });

  return FeatureTab;
});
