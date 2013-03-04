define([
  'backbone',
  'ender',
  'remoteStorage',
  'views/panels',
  'views/featureBox',
  'views/map',
  'views/miniMap',
  'views/modal/userOptions',
  'views/modal/overlayManager',
  'views/modal/featureDetails',
  'views/modal/addFeature',
  'template/helpers/renderPos'
], function(Backbone, $, remoteStorage, panels, FeatureBox, Map, MiniMap, UserOptions, OverlayManager, FeatureDetails, AddFeature, renderPos) {


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
     * Events: events
     *
     * delegting events on UI
     */
    events: {
        'click #toggleFeatureBox': 'boxToggle'
      , 'click #toggleMiniMap': 'miniMapToggle'
      , 'click #toggleFullscreen': 'fullscreenToggle'
      , 'click #addOverlay': 'showOverlaysManager'
      , 'click #userOptions': 'showUserOptions'
      , 'click #modal-close': 'closeModal'
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
       * Property: aether
       *
       * event aggregator from <World>
       */
      this.aether = this.world.aether;


      /**
       * Event: feature:focus
       *
       * listens on <aether> and jumps map to feature in focus
       */
      this.aether.on('feature:focus', function( feature ){
        this.map.jumpToFeature(feature);
      }.bind(this));

      /**
       * Event: feature:uuid:show
       *
       * listens on <aether> and show details of feature with given uuid
       */
      this.aether.on('feature:uuid:show', function(uuid){
        var feature = this.world.getFeature(uuid);
        if(feature) {
          console.log(feature);
          this.modal = new FeatureDetails({ feature: feature });
          this.modal.show();
        }
      }.bind(this));

      this.aether.on('feature:new', function(location){
        var feature = this.world.newFeature(location);
        console.log(feature);
        this.modal = new FeatureDetails({ feature: feature });
        this.modal.show();
      }.bind(this));

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
       * Property: featureBox
       */
      this.featureBox = new FeatureBox({ world: this.world, aether: this.aether, feeds: this.world.geoFeeds});

      this.listenTo(this.featureBox, 'change-tab', function(collection) {
        if(this.modal && this.modal.setCollection) {
          this.modal.setCollection(collection);
        }
      }.bind(this));

      /**
       * creates minimap
       */
      this.miniMap = new MiniMap({world: this.world, map: this.map});

      /**
       * creates statusPanel
       */
      this.statusPanel = new panels.Status({model: this.world, ui: this});
      this.controlPanel = new panels.Control({world: this.world });

      /**
       *  creates Sidebar
       */
      this.sideBar = new panels.SideBar();

      // FIXME: move to extension
      function setupRemoteStorage() {
        remoteStorage.util.silenceAllLoggers();
        if(this.world.user.get('remoteStorage')) {
          $(document.body).prepend('<div id="remotestorage-connect"></div>');
          remoteStorage.claimAccess('locations', 'rw').
            then(function() {
              remoteStorage.displayWidget('remotestorage-connect');
              remoteStorage.schedule.disable();
            });
        } else {
          $('#remotestorage-connect').remove();
          remoteStorage.flushLocal();
        }
      }

      this.world.user.on('change:remoteStorage', setupRemoteStorage.bind(this));
      setupRemoteStorage.apply(this, []);
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
      this.closeModal();
    },

    /**
     * Method: closeModal
     *
     * Close the current modal dialog, then <cleanupModal>
     */
    closeModal: function() {
      if(this.modal) {
        this.modal.hide();
        this.cleanupModal();
      }
    },

    /**
     * Method: cleanupModal
     *
     * Removes all reference to the current modal dialog.
     *
     */
    cleanupModal: function() {
      if(this.modal) {
        this.stopListening(this.modal);
        delete this.modal;
      }
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
     * Method: toggleOverlaysManager
     *
     * displays <OverlaysManager> modal
     */
    showOverlaysManager: function(){
      this.modal = new OverlayManager();
      this.modal.show();
    },

    /**
     * Method: toggleUserOptions
     *
     * shows <UserOptions> modal 
     */
    showUserOptions: function() {
      this.modal = new UserOptions({user: this.world.user, aether: this.aether});
      this.modal.show();
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
        this.sideBar.show();
        this.fullScreen = false;
      } else {
        this.miniMap.hide();
        this.statusPanel.hide();
        this.controlPanel.hide();
        this.sideBar.hide();
        this.fullScreen = true;
      }
    }
  });

  return UI;

});
