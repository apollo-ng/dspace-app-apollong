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
      this.world.on('change', function(event, data){
        this.recenter();
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
      this.userLayer = this.addOverlay( this.world.userFeed );

      /**
       * need frame
       */
      var self = this;
      this.world.userFeed.collection.on( 'change:geometry', function( e ){
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

    recenter: function(){
      var mapCenter = this.world.get('mapCenter');
      if(mapCenter && this.frame){
        this.frame.setCenter(mapCenter);
      }
    },

    /**
     * creates frame using ModestMaps library
     */
    createFrame: function(){
      var self = this;
      var config = this.config;

      var template = config.tileSet.template; //FIXME introduce BaseMap
      var layer = new MM.TemplatedLayer(template); //FIXME fix what? @|@

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
     * FIXME hack to add tikiman
     */
    createUserLayer: function(){

      var markerLayer = markers.layer();
      this.userLayer = markerLayer;

      var center = this.world.user.get('geoLocation');
      if(center == undefined){ return };
      var userData = {
        geometry: {
          coordinates: [center.coords.longitude, center.coords.latitude]
        },
        properties: {type: 'user'}
      };

      /**
       * define a factory to make markers
       */
      markerLayer.factory(function(featureJson){
        return new Marker({ featureJson: featureJson }).render();
      }.bind(this));
      /**
       * display markers MM adds it to DOM
       * .extent() called to redraw map!
       */
      markerLayer.features([userData]);
      this.frame.addLayer(markerLayer).draw();

      return markerLayer

    },

    /**
     * moves user related markers
     * FIXME use move layer
     */
    updateUserLayer: function(){
      this.frame.removeLayer(this.userLayer);
      this.createUserLayer();
    },

    addMapLayer: function( collection ){
      /**
       * Add markers
       * mapbox lib NOT same as ModestMap
       */
      var markerLayer = markers.layer();

      /**
       * define a factory to make markers
       */
      markerLayer.factory(function(featureJson){
        var marker = new Marker({ featureJson: featureJson });
        marker.on('click', function() {
          this.trigger('marker-click', featureJson.uuid);
        }.bind(this));
        return marker.render();
      }.bind(this));

      var features = collection.toJSON();

      /**
       * display markers MM adds it to DOM
       * .extent() called to redraw map!
       */
      markerLayer.features(features);

      if(features) {
        this.frame.addLayer(markerLayer);//.setExtent(markerLayer.extent());
        this.frame.draw();
        return markerLayer;
      } else {
        this.recenter();
      }

    },

    removeLayer: function(layer) {
      var oldLen = this.frame.layers.length;
      if(layer) {
        this.frame.removeLayer(layer);
        this.frame.draw();
      }
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
      var mmCoordinate = this.frame.locationCoordinate({
        lat: feature.get( 'lat' ),
        lon: feature.get( 'lon' ) });

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
