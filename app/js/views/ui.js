define([
  'backbone',
  'views/panels',
  'views/featureBox',
  'views/miniMap'
], function(Backbone, panels, FeatureBox, MiniMap) {

  /**
   * main UI logic
   */
  var UI = Backbone.View.extend({

    el: '#ui',

    events: {
      'click #toggleFeatureBox': 'boxToggle'
      , 'click #toggleMiniMap': 'miniMapToggle'
      , 'click #toggleFullscreen': 'fullscreenToggle'
      , 'click #featureOptions': 'toggleOverlaysPanel'
      , 'click #userOptions': 'toggleOptionsPanel'
    },

    initialize: function(){
      this.world = this.options.world;
      this.map = this.options.map;

      /**
       * for managing active overlays
       */
      this.overlaysPanel = new panels.Overlays();

      /**
       * featureBox
       */
      this.featureBox = new FeatureBox({ map: this.map, collection: this.world.featureCollections[1]});

      /**
       * creates minimap
       */
      this.miniMap = new MiniMap({world: this.world, config: this.map.config});

      /**
       * creates statusPanel
       */
      this.statusPanel = new panels.Status({model: this.world.user});
      this.controlPanel = new panels.Control({ ui: this, world: this.world });

      /**
       * create OptionsPanel
       */
      this.optionsPanel = new panels.Options();

      // for now fullscreen off by default FIXME
      this.fullScreen = false;
    },

    render: function(){
      this.featureBox.visible = true;

      this.miniMap.render();
      this.miniMap.visible = true;

      this.statusPanel.render();
      this.statusPanel.visible = true;

      this.controlPanel.render();
      this.controlPanel.visible = true;
    },

    /**
     * toggles state (on/off) for elements
     */
    boxToggle: function() {
      this.featureBox.toggle();
    },

    miniMapToggle: function(event){
      this.miniMap.toggle();
    },

    toggleOverlaysPanel: function(event){
      this.overlaysPanel.toggle();
    },

    toggleOptionsPanel: function(event) {
      this.optionsPanel.toggle();
    },

    /**
     * toggles fulls creen mode
     */
    fullscreenToggle: function() {
      if(this.fullScreen) {
        this.miniMap.show();
        this.statusPanel.show();
        this.featureBox.show();
        this.fullScreen = false;
      } else {
        this.miniMap.hide();
        this.statusPanel.hide();
        this.featureBox.hide();
        this.fullScreen = true;
      }
    }
  });

  return UI;

});