define([
  'ender',
  'backbone',
  'views/panels',
  'views/featureTab',
  'templateMap'
], function($, Backbone, panels, FeatureTab, templates) {
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
      template: templates.featureBox,

      events: {
        'click *[data-tab]': 'clickTab'
      },

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
            feed: feed,
            aether: this.aether
          });
          tab.index = i;
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
        this.$el.html(this.template({
          tabs: this.featureTabs
        }));
        _(this.featureTabs).each(function(featureTab){
          var renderedTemplate = featureTab.render();
          this.$el.append(renderedTemplate);
          featureTab.hide();
          featureTab.tab = this.$('.featureBoxTabs > .tab[data-tab="' + featureTab.index + '"]');
        }.bind(this));

        if(this.featureTabs.length > 0) {
          this.selectTab(0);
        }
        return this.el;
      },

      clickTab: function(event) {
        this.selectTab($(event.target).attr('data-tab'));
      },

      selectTab: function(index) {
        if(typeof(this.currentTabIndex) !== 'undefined') {
          var previousTab = this.featureTabs[this.currentTabIndex]
          previousTab.hide();
          previousTab.tab.removeClass('active');
        }
        var currentTab = this.featureTabs[index]
        currentTab.show();
        currentTab.tab.addClass('active');
        this.currentTabIndex = index;
        this.trigger('change-tab', this.featureTabs[index].collection);
      },

      showFX: function(){
        this.$el.animate({ top: 0, duration: 700  });
        this.$el.fadeIn(600);
      },

      hideFX: function(){
        // FIXME: use $el height for the animation instead of fixed value
        this.$el.animate({ top: -400, duration: 700 });
        this.$el.fadeOut(600);
      }
    });

  return FeatureBox;
});
