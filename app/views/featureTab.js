define([
  'require',
  'ender',
  'backbone',
  'views/featureBoxItem',
  'templateMap'
], function(require, $, Backbone, FeatureBoxItem, templates) {

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
      'change input[name="visible"]': 'updateVisible',
      'change input[name="only"]': 'updateOnly'
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

      this.collection.on('add', function(feature) {
        this.renderFeature(feature);
      }.bind(this));
    },

    updateVisible: function(event) {
      this.feed.set('visible', $(event.target).attr('checked'));
      this.render();
    },

    updateOnly: function(event) {
      this.feed.set('only', $(event.target).attr('checked'));
      console.log('FIXME: Hide/Restore other markers on map');
      this.render();
    },

    /*
     * FIXME doplicates <FeatureCollection.toJSON>
     * FIXME can leak session state to collection
     */
    render: function(){
      if(this.rendered) {
        return this.el;
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
      featureBoxItem.on('selected', function() {
        this.aether.trigger('select-feature', feature);
      }.bind(this));
      var renderedTemplate = featureBoxItem.render();
      this.itemWrapper.append(renderedTemplate);
    },

    reset: function() {
      if(this.rendered) {
        this.itemWrapper.empty();
        this.featureIndexCounter = 0;
      }
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
