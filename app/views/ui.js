define([
  'backbone',
  'ender',
  'geofeeds/search',
  'views/statusPanel',
  'views/sideBar',
  'views/widgetModal',
  'views/box/featureBox',
  'views/map/map',
  'views/map/miniMap',
  'views/modal/userOptions',
  'views/modal/overlayManager',
  'views/modal/featureDetails'
], function(Backbone, $, SearchFeed, StatusPanel, SideBar, WidgetModal, FeatureBox, Map, MiniMap, UserOptions, OverlayManager, FeatureDetails, AddFeature, renderPos) {

  /**
   * Class: UI
   *
   * main view with all interaction elements
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
     * delegting DOM events on UI
     */
    events: {
        'click #toggleSideBar': 'toggleSideBar'
      , 'click #toggleMiniMap': 'toggleMiniMap'
      , 'click #toggleFullscreen': 'toggleFullscreen'
      , 'click #addOverlay': 'showOverlaysManager'
      , 'click #userOptions': 'showUserOptions'
      , 'click #modal-close': 'closeModal'
      , 'submit #searchForm': 'createSearch'
      , 'contextmenu #widgetBar': 'toggleWidgetModal'
    },

    /**
     * Method: initialize
     */
    initialize: function(){

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
       * listens on <aether> and delegates to <focusOnFeature>
       */
      this.aether.on('feature:focus', this.focusOnFeature.bind(this));

      /**
       * Event: feature:uuid:show
       *
       * listens on <aether> and delegats to <showFeatureDetails>
       */
      this.aether.on('feature:uuid:show', this.showFeatureDetails.bind(this));

      /**
       * Event: feature:new
       *
       * listens on <aether> and creates to <createFeature>
       */
      this.aether.on('feature:new', this.createFeature.bind(this));

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
      this.featureBox = new FeatureBox({ world: this.world, feeds: this.world.geoFeeds});

      /**
       * Property: miniMap
       */
      this.miniMap = new MiniMap({world: this.world, map: this.map});

      /**
       * Property: statusPanel
       */
      this.statusPanel = new StatusPanel({world: this.world, ui: this});

      /**
       * Property: sideBar
       */
      this.sideBar = new SideBar();

      /**
       * Property: widgetModal
       */
      this.widgetModal = new WidgetModal();
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
    },

    /**
     * Method: focusOnFeature
     *
     * focuses map on given feature
     */
    focusOnFeature: function(feature){
      this.map.jumpToFeature(feature);
    },

    /**
     * Method: showFeatureDetails
     *
     * opens modal showing details of feature with given uuid
     *
     * Receives:
     *
     *   uuid - id of feature to look up in <World.featureIndex>
     */
    showFeatureDetails: function(uuid){
      var feature = this.world.getFeature(uuid);
      if(feature) {
        this.modal = new FeatureDetails({ feature: feature });
        this.modal.show();
      }
    },

    /**
     * Method: createFeature
     *
     * gets new feature from <World.newFeature> and shows it in modal
     */
    createFeature: function(location){
      var feature = this.world.newFeature(location);
      this.modal = new FeatureDetails({
        feature: feature,
        mode: 'new'
      });
      this.modal.show();
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
     * Method: closeModal
     *
     * Close the current modal dialog and clean up after it
     */
    closeModal: function() {
      if(this.modal) {
        this.modal.hide();
        this.stopListening(this.modal);
        delete this.modal;
      }
    },

    /**
     * Method: toggleFeatureBox
     *
     * toggles <FeatureBox>
     */
    toggleSideBar: function() {
      this.sideBar.toggle();
    },

    /**
     * Method: toggleMiniMap
     *
     * toggles <MiniMap>
     */
    toggleMiniMap: function(){
      this.miniMap.toggle();
    },

    /**
     * Method: showBuffles
     *
     * shows top and bottom Buffles
     */
    showBuffles: function(){
      var fadeDuration = 450;
      $('#topBaffle').animate({ height: 47, duration: fadeDuration });
      $('#topBaffle').fadeIn(fadeDuration);
      $('#bottomBaffle').animate({ height: 47, duration: fadeDuration });
      $('#bottomBaffle').fadeIn(fadeDuration);
    },

    /**
     * Method: hideBuffles
     *
     * hides and bottom Buffles
     */
    hideBuffles: function(){
      var fadeDuration = 450;
      $('#topBaffle').animate({ height: 0, duration: fadeDuration });
      $('#topBaffle').fadeOut(fadeDuration);
      $('#bottomBaffle').animate({ height: 0, duration: fadeDuration });
      $('#bottomBaffle').fadeOut(fadeDuration);
    },

    /**
     * Method: toggleFullscreen
     *
     * toggles fulls creen mode
     */
    toggleFullscreen: function() {
      if(this.fullScreen) {
        this.miniMap.show();
        this.showBuffles();
        this.sideBar.show();
        this.fullScreen = false;
      } else {
        this.miniMap.hide();
        this.hideBuffles();
        this.sideBar.hide();
        this.fullScreen = true;
      }
    },

    /**
     * Method: toggleWidgetModal
     *
     * toggles <WidgetModal>
     */
    toggleWidgetModal: function(){
      this.widgetModal.toggle();
    },

    /**
     * Method: createSearch
     *
     * EXPERIMENTAL - may move to extension!
     */
    createSearch: function(event) {
      event.preventDefault();
      var query = event.target.query.value;
      var searchFeed = new SearchFeed({ query: query, extent: this.map.frame.getExtent() });
      var index = this.world.addFeed(searchFeed, true);
    }
  });

  return UI;

});
