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

        /**
         * Property: world
         *
         * reference to <World>
         */
        this.world = this.options.world;

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
        this.featureTabs = [];

        this.initializeTabs();

        this.listenTo(this.world, 'add-feed', this.addTab.bind(this));
        this.listenTo(this.world, 'remove-feed', this.removeTab.bind(this));
        this.listenTo(this.world, 'select-feed', this.selectTab.bind(this));

      },

      /**
       * Method: initializeTabs
       *
       * creates feature tabs for all feeds, using <addTab>.
       *
       */
      initializeTabs: function(){
        this.feeds.forEach(this.addTab.bind(this));
      },

      /**
       * Method: addTab
       *
       * Adds a new <FeatureTab> representing the given 'feed'.
       *
       * Parameters:
       *   feed - instance of a descendent of <GeoFeeds.Base>
       */
      addTab: function(feed) {
        var tab = new FeatureTab({
          feed: feed,
          aether: this.aether
        });
        tab.index = this.featureTabs.length,
        this.featureTabs.push(tab);
        this.adjustRemovable();

        // FIXME: refactor rendering of tabs, so they can be added / removed
        //        without refreshing the entire <FeatureBox>.
        setTimeout(this.render.bind(this), 0);
      },

      removeTab: function(index) {
        var tab = this.featureTabs.splice(index, 1)[0];
        var ftl = this.featureTabs.length;
        for(var i=index;i<ftl;i++) {
          this.featureTabs[i].index = i;
          this.featureTabs[i].reRender();
        }
        this.adjustRemovable();
        this.selectTab(Math.max(index - 1, 0));
        this.render();
      },

      adjustRemovable: function() {
        this.featureTabs[0].setRemovable(this.featureTabs.length !== 1);
      },

      /**
       * Method: getCurrentCollection
       *
       * Determines the currently active tab and returns it's <FeatureCollection>.
       *
       */
      getCurrentCollection: function() {
        var tab = this.featureTabs[this.currentTabIndex];
        if(tab) {
          return tab.collection;
        }
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

      /**
       * Method: clickTab
       *
       * Sets the current feed (-index) on the world.
       * This method handles clicks on the tab icons.
       */
      clickTab: function(event) {
        this.world.setCurrentFeed($(event.target).attr('data-tab'));
      },

      /**
       * Method: selectTab
       *
       * Make tab at given index active. The tab index starts at 0.
       *
       * This method is called initially in <render> (with index set to 0), and
       * whenever the <World> fires 'select-feed'.
       *
       * Fires:
       *   change-tab - passing the <FeatureCollection> of the newly selected tab
       */
      selectTab: function(index) {
        if(typeof(this.currentTabIndex) !== 'undefined') {
          var previousTab = this.featureTabs[this.currentTabIndex]
          if(previousTab) {
            previousTab.hide();
            previousTab.tab.removeClass('active');
          }
        }
        var currentTab = this.featureTabs[index]
        currentTab.show();
        currentTab.tab.addClass('active');
        this.currentTabIndex = index;
        this.trigger('change-tab', this.featureTabs[index].collection);
      },

      // no-doc
      showFX: function(){
        this.$el.animate({ top: 0, duration: 700  });
        this.$el.fadeIn(600);
      },

      // no-doc
      hideFX: function(){
        // FIXME: use $el height for the animation instead of fixed value
        this.$el.animate({ top: -400, duration: 700 });
        this.$el.fadeOut(600);
      }
    });

  return FeatureBox;
});
