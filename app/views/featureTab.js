define([
  'ender',
  'backbone',
  'views/featureBoxItem',
  'templateMap'
], function($, Backbone, FeatureBoxItem, templates) {

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
    template: templates.featureTab,

    events: {
      'change input[name="visible"]': 'updateVisible'
    },

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
        this.reset();
      }.bind(this));

      /**
       * Event: feature:current
       *
       * listens on collection for *feature:current* events
       * then trigger them on ether passing forward future
       */
      this.collection.on( 'feature:current', function( feature ){
        this.aether.trigger('feature:current', feature );
      }.bind(this));

      this.collection.on('add', function(feature) {
        this.renderFeature(feature);
      }.bind(this));
    },

    updateVisible: function(event) {
      this.feed.set('visible', $(event.target).attr('checked'));
      this.render();
    },

    /*
     * FIXME doplicates <FeatureCollection.toJSON>
     * FIXME can leak session state to collection
     */
    render: function(){
      if(this.rendered) {
        return;
      }

      this.visible = this.feed.get('visible');

      /**
       *  Render Overlay Title
       */
      this.$el.html(this.template(this));

      this.itemWrapper = this.$('.featureItems');

      this.rendered = true;

      this.$el.attr('data-index', this.index);

      this.featureIndexCounter = 0;

      return this.el;
    },

    renderFeature: function(feature) {
      this.render();
      var featureIndex = this.featureIndexCounter++;
      feature.set( 'index', featureIndex );
      var featureBoxItem = new FeatureBoxItem({
        tab: this,
        model: feature,
        aether: this.aether
      });
      var renderedTemplate = featureBoxItem.render();
      this.itemWrapper.append(renderedTemplate);
    },

    reset: function() {
      this.itemWrapper.empty();
      this.featureIndexCounter = 0;
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
