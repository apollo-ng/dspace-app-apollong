define([
  'backbone',
  'views/panels',
  'views/featureBox',
  'views/map',
  'views/miniMap',
  'views/modal/userOptions'
], function(Backbone, panels, FeatureBox, Map, MiniMap, UserOptions) {


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
   * * <overlaysPanel>
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
     *
     * Property: $el
     *
     * Backbone wrapped element to reuse
     */
    el: '#ui',

    /**
     * Property: fullScreen
     *
     * keeps state if UI fullScreen defaulting to false
     */
    fullScreen: false,

    /**
     * Property: overlaysPanel
     *
     * <OverlaysPanel> *ui element* for managing active overlays
     */
    overlaysPanel: new panels.Overlays(),

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
      , 'click #userOptions': 'toggleUserOptions'
    },

    /**
     * Method: initialize
     */
    initialize: function(){
      var self = this;

      /**
       * Property: world
       *
       * reference to the <World> from init options
       */
      this.world = this.options.world;

      /**
       * Property: dspace
       *
       * reference to the global Backbone.Router called <DSpace>
       */
      this.dspace = this.options.dspace;

      /**
       * Property: map
       *
       * reference to the <Map> from
       *
       * passed to <MiniMap>
       * used to jump <Map>
       */

      this.map = new Map({ world: this.world });

      /**
       * Property: aether
       *
       * event aggregator from <World>
       */
      this.aether = this.world.aether;


      /**
       * Event: feature:current
       *
       * jumps map to feature set to current
       */
      this.aether.on('feature:current', function( feature ){
        self.jumpMapToFeature(feature);
      });

      /**
       * Property: featureBox
       */
      this.featureBox = new FeatureBox({ aether: this.aether, feeds: this.world.geoFeeds});

      /**
       * creates minimap
       */
      this.miniMap = new MiniMap({world: this.world, config: this.map.config});

      /**
       * creates statusPanel
       */
      this.statusPanel = new panels.Status({model: this.world});
      this.controlPanel = new panels.Control({world: this.world });

      /**
       *  creates Sidebar
       */
      this.sideBar = new panels.SideBar();

    },

    /**
     * Method: render
     *
     * render all elements and sets them visible
     */
    render: function() {
      this.map.render();

      this.featureBox.render();
      this.featureBox.visible = true;

      this.miniMap.render();
      this.miniMap.visible = true;

      this.statusPanel.render();
      this.statusPanel.visible = true;

      this.controlPanel.render();
      this.controlPanel.visible = true;

      this.sideBar.render();
      this.sideBar.visible = true;

    },

    reset: function() {
      //this.map.reset();
      this.hideUserOptions();
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
     * Method: toggleUserOptions
     *
     * toggles <Modal.UserOptions> using <showUserOptions>/<hideUserOptions>
     */
    toggleUserOptions: function() {
      if(this.userOptions) {
        //this.hideUserOptions();
        this.dspace.removeFlag('userOptions');
      } else {
        this.dspace.addFlag('userOptions');
        //this.showUserOptions();
      }
    },

    /**
     * Method: hideUserOptions
     *
     * Hides the <Modal.UserOptions> view and cleans up it's reference.
     *
     */
    hideUserOptions: function() {
      if(! this.userOptions) {
        return;
      }
      this.userOptions.hide();
      delete this.userOptions;
    },

    /**
     * Method: showUserOptions
     *
     * Creates a <Modal.UserOptions> view and displays it.
     */
    showUserOptions: function() {
      if(this.userOptions) {
        return;
      }
      this.userOptions = new UserOptions({
        user: this.world.user,
        aether: this.aether
      });
      this.userOptions.show();
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
        this.controlPanel.show();
        this.featureBox.show();
        this.fullScreen = false;
      } else {
        this.miniMap.hide();
        this.statusPanel.hide();
        this.controlPanel.hide();
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
