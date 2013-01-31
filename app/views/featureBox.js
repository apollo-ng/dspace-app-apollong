define([
  'backbone',
  'views/panels',
  'views/featureTab'
], function(Backbone, panels, FeatureTab) {
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
         * Attribute: collections
         *
         * an array of <FeatureCollection>s from a <World>
         */
        this.collections = this.options.collections;
        this.featureTabs = [];

        for(var i=0; i < this.collections.length; i++){
          var collection = this.collections[i];
          var featureTab = new FeatureTab({
            collection: collection,
            aether: this.aether
          });
          this.featureTabs.push(featureTab);
        };
      },

      /**
       * Method: render
       *
       * renders a <FeatureBoxItem> view for each model
       * adding *index* to them and appends them to $el
       */
      render: function(){
        var self = this;

        _(this.featureTabs).each(function(featureTab, index){
          var renderedTemplate = featureTab.render();
          self.$el.append(renderedTemplate);
        });
        return self.el;
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
