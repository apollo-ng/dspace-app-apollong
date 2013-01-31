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
     * gets option map
     */
    var FeatureBox = panels.Base.extend({

      el: '#featureBox',
      initialize: function(){
        /*
         * convienience accessor to map
         * for use in callbacks
         */
        this.map = this.options.map;

        var self = this;

        // poplates box when collections load
        this.collection.on( 'reset', function( event, data ){
          self.render( );
        });

        // listen for focus requests from features and
        // call map for focus
        // FIXME bind to world.currentFeature()
        this.collection.on( 'featureboxitem:current', function( event ){
          self.map.jumpToFeature( event.model );
        });
      },

      render: function(){
        var self = this;
        /**
         * Loop through each feature in the model
         * example how to add more data to the view:
         */
        _(this.collection.models).each(function(feature, index){
          feature.set( 'index', index );
          var featureBoxItem= new FeatureBoxItem({
              model: feature
          });
          var renderedTemplate = featureBoxItem.render();

          /**
           * append to backbone provided $obj
           */
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
