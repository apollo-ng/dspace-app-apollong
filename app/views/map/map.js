define([
  'backbone',
  'modestmaps',
  'views/map/mapContext',
  'views/map/overlay',
], function(Backbone, MM, MapContext, Overlay) {

  /* Class: Map
   *
   * main UI logic for the Map
   *
   * (see map.png)
   *
   * creates:
   *   * *BaseMap* with default *TileSet*
   *
   * listens:
   *   * world change *mapCenter*
   */
  var Map = Backbone.View.extend({

    el: '#map',

    /**
     * Event: clicks
     *
     * Listens on click events
     *
     * * right-click/press -> shows ContextPanel
     * * click hides ContextPanel
     */
    events: {
      "click": "hideMapContext",
      "contextmenu": "showMapContext",
      'click .markerimage': 'showFeature'
    },

    /**
     * Method: initialize
     *
     * Parameters:
     *
     *   options.world - world which creates map
     *   options.config - initial configuration
     */
    initialize: function( options ){

      this.world = this.options.world;
      this.aether = this.world.aether;
      this.config = this.world.config.map;

      /**
       * Event: world:mapCenter
       *
       * listens to changes of the mapcenter from <MiniMap>
       */
      this.world.on('change:mapCenter', function(event, data){
        this.recenter();
      }.bind(this));

      /**
       * Event: user:mapProvider
       *
       * listens to changed user configuration and changes basemap with <Map.switchBaseMap>
       */
      this.world.user.on('change:mapProvider', function(event, data){
        this.switchBaseMap();
      }.bind(this));

      /**
       * mapContext for right-click / longpress
       */
      this.mapContext = new MapContext({ map: this });

      this.mapContext.on('command:add-feature', function(point) {
        var location = this.frame.pointLocation(point);
        this.aether.trigger('feature:new', location);
      }.bind(this));

      this.mapContext.on('command:recenter-here', function(point) {
        this.frame.setCenter(this.frame.pointLocation(point));
      }.bind(this));

      this.mapContext.on('command:where-am-i', function() {
        this.frame.setCenter(this.world.user.getLocation());
      }.bind(this));

      this.mapContext.on('command:set-my-location', function(point) {
        var location = this.frame.pointLocation(point);
        this.world.setStaticUserLocation(location);
      }.bind(this));

      this.world.on('add-feed', this.addOverlay.bind(this));
      this.world.on('remove-feed', this.removeOverlay.bind(this));

      setTimeout(function() {

        dspace.declareHook('mapCommands', function(commands) {
          for(var commandName in commands) {
            this.addCommand(commandName, commands[commandName]);
          }
        }.bind(this));

      }.bind(this), 0);

    },

    addCommand: function(commandName, action) {
      this.mapContext.on('command:' + commandName, function(point) {
        action(point, this.frame.pointLocation(point));
      }.bind(this));
    },

    /**
     * Method: render
     * renders the map
     */
    render: function(){

      /**
       * crate frame -- uses MapBox
       */
      this.frame = this.createFrame();

      this.overlays = [];
      this.world.geoFeeds.forEach(this.addOverlay.bind(this));

      /**
       * creates an overlay containing the users avatar
       * world listens to user and updates the geometry
       * when the usercollection changes pushes the
       * changed features to the markerlayer and redraw;
       */
      this.userLayer = this.addOverlay( this.world.user.feed );

      /**
       * need frame
       */
      this.world.user.feed.collection.on( 'change:geometry', function( e ){
        if( e.id === 'avatar' ) {
          this.userLayer.render( );
        }
      }.bind(this));

    },

    /**
     * Method: hideMapContext
     * Failsafe: A click on the map should clear all modal/context windows
     */
    hideMapContext: function () {
      this.mapContext.hide();
    },

    /**
     * Method: showMapContext
     *  Map right-click/long touch context menu
     */
    showMapContext: function (event) {
      this.mapContext.show(event);
    },

    /**
     * Method: addOverlay
     * gets a feed object with instantiated collection
     * returns overlay
     */
    addOverlay: function( feed ){
      var overlay = new Overlay({
        map: this,
        feed: feed
      });
      overlay.render();
      this.overlays[feed.index] = overlay;
      return overlay;
    },

     /**
     * Method: removeOverlay
     * removes Overlay specified by index
     * returns overlay
     */
    removeOverlay: function(index) {
      //console.log('remove overlay', index);
      var overlay = this.overlays.splice(index, 1)[0];
      overlay.hide();
      //console.log('overlays', this.overlays);
      var ol = this.overlays.length;
      for(var i=index;i<ol;i++) {
        this.overlays[i].render();
      }
    },

    /**
     * Method: recenter
     *
     * sets the center of the map from <world>
     */
    recenter: function(){
      var mapCenter = this.world.get('mapCenter');
      if(mapCenter && this.frame){
        this.frame.setCenter(mapCenter);
      }
    },

    /**
     * Method: createBaseMap
     *
     * creates a ModestMaps layer from <User.attributes.mapProvider>
     */
    createBaseMap: function(){
      var mapProvider = this.world.user.get('mapProvider');
      var template = this.config.tileSets[mapProvider];
      var layer = new MM.TemplatedLayer(template);
      return layer;
    },

    /**
     * Method: switchBaseMap
     *
     * changes the basemap using ModestMaps library
     */
    switchBaseMap: function(){
      var layer = this.createBaseMap();
      this.frame.insertLayerAt(0, layer);
      this.frame.removeLayerAt(1);
      this.frame.draw();
    },

    /**
     * Method: createFrame
     *
     * creates frame using ModestMaps library
     */
    createFrame: function(){
      var config = this.config;

      var layer = this.createBaseMap();

      var modestmap = new MM.Map(
        this.el,
        layer,
        null,
        [new easey_handlers.TouchHandler(),
         new easey_handlers.DragHandler(),
         new easey_handlers.MouseWheelHandler()]
      );

      /**
       *  setup boundaries
       */
      modestmap.setZoomRange(config.minZoom, config.maxZoom);
      var location = new MM.Location(config.geolat, config.geolon);

      /**
       * show and zoom map
       */
      modestmap.setCenterZoom(location, config.defaultZoom);

      /**
       * callbacks on map redraw
       * sets current mapCenter and mapZoom
       */
      modestmap.addCallback('drawn', function(m){
        this.world.set('mapCenter', modestmap.getCenter());
        this.world.set('mapZoom', modestmap.getZoom());
      }.bind(this));

      return modestmap;

    },

    /**
     * Method: jumpToFeature
     *
     * animates map to focus location of passed feature
     *
     * Parameters:
     *
     *   feature - <Feature>
     *
     */
    jumpToFeature: function( feature ) {

      /**
       * easey interaction library for modestmaps
       */
      var mmCoordinate = this.frame.locationCoordinate(feature.getLatLon());

      /**
       * TODO document
       */
      easey().map(this.frame)
        .to(mmCoordinate)
        .zoom(this.config.maxZoom).optimal();
    },

    showFeature: function(event){
      this.aether.trigger('feature:uuid:show', event.target.id);
    }
  });

  return Map;
});
