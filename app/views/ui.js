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
   *
   * elements:
   * * <FeatureBox>
   * * <MiniMap>
   * * <StatusPanel>
   * * <ControlPanel>
   */
  var UI = Backbone.View.extend({

    /**
     * Property: el
     *
     * DOM element which will host UI '#id'
     */
    el: '#ui',

    /**
     * Property: fullScreen
     *
     * keeps state if UI fullScreen defaulting to false
     */
    fullScreen: false,

    /**
     * Events: events
     *
     * delegting events on UI
     */
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

      /**
       * Event: feature:current
       *
       * jumps map to feature set to current
       */
      this.aether.on('feature:current', function( feature ){
        self.jumpMapToFeature(feature);
      });

      /**
       * for managing active overlays
       */
      this.overlaysPanel = new panels.Overlays();

      /**
       * featureBox
       * FIXME at this moment hardcoded passing second collection on a world
       */
      this.featureBox = new FeatureBox({ aether: this.aether, collection: this.world.featureCollections[1]});

      /**
       * creates minimap
       */
      this.miniMap = new MiniMap({world: this.world, config: this.map.config});

      /**
       * creates statusPanel
       */
      this.statusPanel = new panels.Status({model: this.world.user});
      this.controlPanel = new panels.Control({world: this.world });

      /**
       * create OptionsPanel
       */
      this.optionsPanel = new panels.Options();
    },

    /**
     * Method: render
     *
     * render all elements and sets them visible
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
     * Method: boxToggle
     *
     * toggles <FeatureBox>
     */
    boxToggle: function() {
      this.featureBox.toggle();
    },

    /**
     * Method: miniMapToggle
     *
     * toggles <MiniMap>
     */
    miniMapToggle: function(){
      this.miniMap.toggle();
    },

    /**
     * Method: toggleOverlaysPanel
     *
     * toggles <OverlaysPanel>
     */
    toggleOverlaysPanel: function(){
      this.overlaysPanel.toggle();
    },

    /**
     * Method: toggleOptionsPanel
     *
     * toggles <OptionsPanel>
     */
    toggleOptionsPanel: function() {
      this.optionsPanel.toggle();
    },

    /**
     * Method: fullscreenToggle
     *
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
     * delegates to <Map> jumping to given feature
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
