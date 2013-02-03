define([
  // deps
  'backbone',
  'modestmaps',

  'templateMap',

  // views
  'views/panels',
  'views/overlay',
  'views/modal/addFeature'
], function(Backbone, MM,
            templates,
            panels, Overlay, AddFeature) {
  /**
   * Class: MapContext
   *
   * map Context menu
   *
   * (see mapContext.png)
   */
  var MapContext = panels.Base.extend({

    el: '#mapContext',
    template: templates.mapContext,

    events: {
      'click *[data-command]': 'callCommand'
    },

    initialize: function() {
      this.render();
    },

    callCommand: function(event) {
      var item = this.$(event.target);
      this.trigger('command:' + item.attr('data-command'), this.point);
      this.hide();
    },

    render: function() {
      this.$el.html(this.template());
      return this.el;
    },

    showFX: function(event){
      this.point = { x: event.clientX, y: event.clientY };
      this.$el.css( { 'left': this.point.x, 'top': this.point.y });
      this.$el.css( { 'display': 'block'});
      this.$el.fadeIn(350);
    },

    hideFX: function(){
      this.$el.fadeOut(350, this.$el.hide.bind(this.$el));
    }
  });

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
      "click": "hideContextPanel"
      ,"contextmenu": "showContextPanel"
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
      this.dspace = this.options.dspace;
      this.config = this.world.config.map;

      var self = this;
      
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
       * contextPanel for right-click / longpress
       */
      this.contextPanel = new MapContext({ map: this });

      this.contextPanel.on('command:add-feature', function(point) {
        this.dspace.updateState({
          location: JSON.stringify(this.frame.pointLocation(point)),
          modal: 'addFeature'
        });
        
        // var location = this.frame.pointLocation(point);
        // var dialog = new AddFeature(location, { aether: this.world.aether });
        // dialog.render();
        // dialog.show();
      }.bind(this));

    },

    /**
     * Method: hideContextPanel
     * Failsafe: A click on the map should clear all modal/context windows
     */
    hideContextPanel: function () {
      this.contextPanel.hide();
    },

    /**
     * Method: showContextPanel
     *  Map right-click/long touch context menu
     */
    showContextPanel: function (event) {
      this.contextPanel.show(event);
    },

    /**
     * Method: render
     * renders the map
     */
    render: function(){
      var self = this;

      /**
       * crate frame -- uses MapBox
       */
      this.frame = this.createFrame();

      this.overlays = this.world.geoFeeds.map(function(feed) {
        self.addOverlay( feed ).render( );
      }.bind(this));

      /**
       * creates an overlay containing the users avatar
       * world listens to user and updates the geometry 
       * when the usercollection changes pushes the 
       * changed features to the markerlayer and redraw;
       */
      //FIXME #27
      this.userLayer = this.addOverlay( this.world.user.feed );

      /**
       * need frame
       */
      var self = this;
      this.world.user.feed.collection.on( 'change:geometry', function( e ){
        if( e.id == 'avatar' ) {
	        self.userLayer.render( );
	      }
      });



    },
    /**
     * gets a feed object with instantiated collection 
     * returns overlay 
     */
    addOverlay: function( feed ){
        return new Overlay({ 
          map: this, 
          feed: feed })
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
     * creates a ModestMaps layer from either <User.attributes.mapProvider> or <User.config>
     */
    createBaseMap: function(){
      var mapProvider = this.world.user.get('mapProvider');
      if (!mapProvider) {
        mapProvider = this.world.user.get('config').mapProvider;
      }
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
    }
  });

  return Map;
});
