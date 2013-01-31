define([
  'backbone',
  'views/panels',
  'views/featureBoxItem'
], function(Backbone, panels, FeatureBoxItem) {
    /**
     * Class: FeatureBox
     *
     * UI element with list of features
     *
     * gets collection FeatureCollection
     *
     * (see featureBox.png)
     */
    var FeatureBox = panels.Base.extend({

      el: '#featureBox',
      initialize: function(){

        this.aether = this.options.aether;

        var self = this;

        /**
         * Event: reset
         *
         * listens on collection for *reset* events and renders itself
         */
        this.collection.on( 'reset', function( event, data ){
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

      /**
       * Method: render
       *
       * renders a <FeatureBoxItem> view for each model
       * adding *index* to them and appends them to $el
       * FIXME doplicates <FeatureCollection.toJSON>
       * FIXME can leak session state to collection
       */
      render: function(){
        var self = this;

        _(this.collection.models).each(function(feature, index){
          feature.set( 'index', index );
          var featureBoxItem = new FeatureBoxItem({
              model: feature
          });

          var renderedTemplate = featureBoxItem.render();
          self.$el.append(renderedTemplate);
        });
      },

      showFX: function(){
        this.$el.animate({ top: 60, duration: 700  });
        this.$el.fadeIn(600);
      },

      hideFX: function(){
        this.$el.animate({ top: -400, duration: 700 });
        this.$el.fadeOut(600);
      }
    });

  return FeatureBox;
});
