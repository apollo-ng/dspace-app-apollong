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

      /**
       * Property: el
       *
       * DOM element of this view
       */
      el: '#featureBox',

      /**
       * Method: initialize
       */
      initialize: function(){

      /**
       * Property: aether
       *
       * event aggregator from <World>
       */
        this.aether = this.options.aether;

        var self = this;

        /**
         * Property: feeds
         *
         * an array of <GeoFeeds>s from a <World>
         */
        this.feeds = this.options.feeds;

        /**
         * Property: featureTabs
         *
         * an array of <FeatureTab>s
         */
        this.featureTabs = this.initializeTabs();

      },

      /**
       * Method: initializeTabs
       *
       * creates feature tabs for all feeds
       *
       * Returns:
       *
       * featureTabs - an array of <FeatureTab> views
       */
      initializeTabs: function(){
        var tabs = [];
        for(var i=0; i < this.feeds.length; i++){
          var feed = this.feeds[i];
          var tab = new FeatureTab({
            collection: feed.collection,
            aether: this.aether
          });
          tabs.push(tab);
        };
        return tabs;
      },


      /**
       * Method: render
       *
       * renders a <FeatureBoxItem> view for each model
       * adding *index* to them and appends them to $el
       *
       * Returns:
       *
       * this.el - rendered DOM element of view
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
