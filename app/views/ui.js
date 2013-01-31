define([
  'backbone',
  'views/panels',
  'views/featureBox',
  'views/miniMap'
], function(Backbone, panels, FeatureBox, MiniMap) {


  // /**
  //  * X-Browser Fullscreen API Calls
  //  */
  // function reqBFS () {
  //   var e = document.documentElement;
  //   if (e.requestFullscreen) {
  //     e.requestFullscreen();
  //   } else if (e.mozRequestFullScreen) {
  //     e.mozRequestFullScreen();
  //   } else if (e.webkitRequestFullScreen) {
  //     e.webkitRequestFullScreen();
  //   }
  // }

  // function exitBFS () {
  //   if (document.exitFullscreen) {
  //     document.exitFullscreen();
  //   } else if (document.mozCancelFullScreen) {
  //     document.mozCancelFullScreen();
  //   } else if (document.webkitCancelFullScreen) {
  //     document.webkitCancelFullScreen();
  //   }
  // }


  /**
   * Class: UI
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
      this.aether = this.options.aether;

      var self = this;

      this.aether.on('feature:current', function( feature ){
        self.jumpMapToFeature(feature);
      });

      /**
       * for managing active overlays
       */
      this.overlaysPanel = new panels.Overlays();

      /**
       * featureBox
       */
      this.featureBox = new FeatureBox({ aether: this.aether, map: this.map, collection: this.world.featureCollections[1]});

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

    /**
     * Method: render
     */
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
    },

    /**
     * Method: jumpMapToFeature
     *
     * delegates to map jumping to given feature
     *
     * Parameters:
     *
     *   feature - <Feature>
     */
     jumpMapToFeature: function( feature ){
       this.map.jumpToFeature(feature);
     }
  });

  return UI;

});
