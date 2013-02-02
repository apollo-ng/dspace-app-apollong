define([
  // deps
  'backbone',
  'modestmaps',
  'markers',

  'templateMap',

  // models
  'models/marker',

  // views
  'views/panels',
  'views/overlay'
], function(Backbone, MM, markers,
            templates, Marker,
            panels, Overlay) {

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
      this.trigger('command ' + item.attr('data-command'), this.point);
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
      this.config = this.options.config;

      var self = this;
      this.world.on('change', function(event, data){
        console.log("CHANGE WORLD", JSON.stringify(this.world.get('mapCenter')));
        this.recenter();
      }.bind(this));

      /**
       * listens to changes on user and updates related layer
       */
      this.world.user.on('change', function () {
        self.updateUserLayer();
      });

      /**
       * contextPanel for right-click / longpress
       */
      this.contextPanel = new MapContext({ map: this });

      this.contextPanel.on('command add-feature', function(point) {
        console.log("ADD MARKER AT POINT", point);
      });
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

      /**
       * crate frame -- uses MapBox
       */
      this.frame = this.createFrame();

      /**
       * creates user layer to show current location
       */
      this.userLayer = this.createUserLayer();

      /**
       * FIXME keep track on overlays
       */
      var feeds = this.world.geoFeeds;
      for( var i = feeds.length; i--; ) {
        var overlay = new Overlay({ collection: feeds[i].collection, map: this });
      }
    },

    recenter: function(){
      var mapCenter = this.world.get('mapCenter');
      if(mapCenter && this.frame){
        console.log('recenter');
        this.frame.setCenter(mapCenter);
      }
    },

    /**
     * creates frame using ModestMaps library
     */
    createFrame: function(){
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
        return new Marker({ featureJson: featureJson }).render( );
      });
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
        return new Marker({ featureJson: featureJson }).render( );
      });
      /**
       * display markers MM adds it to DOM
       * .extent() called to redraw map!
       */
      markerLayer.features( collection.toJSON( ));
      this.frame.addLayer(markerLayer).setExtent(markerLayer.extent());
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
