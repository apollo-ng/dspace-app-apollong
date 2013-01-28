define([
    'ender', 'underscore', 'backbone',
    'modestmaps', 'easey', 'easey_handlers', 'markers',

    'hbs!templates/mapContext', 'hbs!templates/statusPanel', 'hbs!templates/userOptionModal',
    'hbs!templates/controlPanel', 'hbs!templates/geobarOptionModal', 'hbs!templates/featureOptionModal',
    'hbs!templates/featureInfoModal', 'hbs!templates/featureBoxItem' ], 

  function( 
    $, _, Backbone,
    MM, easey, easey_handlers, markers,

    mapContextTemplate, statusPanelTemplate, userOptionModalTemplate, controlPanelTemplate, 
    geobarOptionModalTemplate, featureOptionModalTemplate, featureInfoModalTemplate, 
    featureBoxItemTemplate ) {
console.log({ MM: MM });

    /**
     * main UI logic for the Map
     */
    var Map = Backbone.View.extend({
      el: $('#map'),

      events: {
        "click": "clearAll"
        ,"contextmenu": "mapContext"
      },

      initialize: function(){
console.log( 'amd' );

          var self = this;
          /**
           * to use with map.world FIXME
           */
          this.world = this.model;

          /**
           * listen to world changes nothing todo here yet
           */
          this.world.on( 'all', function( e, v ) {
            console.log({ world: e, v: v });
          });

          this.world.user.on('change', function ( e, v) {
            self.createUserLayer();
          });

          /**
           * stores config passed from world
           */
          this.config = this.options.config;

          this.fullScreen = false;

          /**
           * to keep track on overlays and feature boxes
           */
          this.overlays = [];

          /**
           * Map Context Menu Template
           */
          this.template = mapContextTemplate;

          /**
           *
           */
          this.userLayer = null;
          /**
           * define relations to other views
           */
          this.statusPanel = new StatusPanel({model: this.world.user});
          this.controlPanel = new ControlPanel({ map: this });
      },

      /**
       * Failsafe: A click on the map should clear all modal/context windows
       */
      clearAll: function () {
        if($('#mapContext').css( 'opacity' ) === '1' ) {
          $('#mapContext').fadeOut(350, function() { $('#mapContext').hide(); });
        }
      },

      /**
       *  Map right-click/long touch context menu
       */
      mapContext: function () {
        if($('#mapContext').css( 'opacity' ) === '1' ) {
          $('#mapContext').fadeOut(350, function() { $('#mapContext').hide(); });
        } else {
          $('#mapContext').css( { 'left': cursorX, 'top': cursorY });
          $('#mapContext').css( { 'display': 'block'});
          $('#mapContext').fadeIn(350);
        }
      },

      /**
       * renders the map
       */
      render: function(){

        /**
         * crate frame -- uses MapBox
         */
        this.frame = this.createFrame();

        /**
         * create StatusPanel with model user
         */
        this.statusPanel.render();
        this.statusPanel.visible = true;

        /**
         * create ControlPanel
         * set controlPanel model to map
         */
        this.controlPanel.render();
        this.controlPanel.visible = true;


        /**
         * create overlay collection and markers
         * sync active feature collection when all items are bound
         */
        var feeds = this.world.featureCollections;
        overlays = [];
        for( var i = feeds.length; i--; ) {
          overlays.push(
            new Overlay({
                collection: feeds[i]
              , map: this })); }

        /**
         * set active overlays on a world
         */
        this.world.set( 'activeOverlays', overlays );

        this.featureBox = new FeatureBox({ map: this });
        this.featureBox.setFeatureCollection( this.world.featureCollections[1] );
        this.featureBox.visible = true;

        /**
         * create miniMap
         */
        this.miniMap = new MiniMap(this.config);
        this.miniMap.render();
        this.miniMap.visible = true;
        //FIXME add render!

      },

      /**
       * toggles state (on/off) for #featureBox
       */
      boxToggle: function() {
        this.featureBox.toggle();
      },

      miniMapToggle: function() {
        this.miniMap.toggle();
      },

      fullscreenToggle: function() {
        if(this.fullScreen) {
          this.miniMap.show()
          this.statusPanel.show();
          this.featureBox.show();
          this.fullScreen = false;
        } else {
          this.miniMap.hide()
          this.statusPanel.hide();
          this.featureBox.hide();
          this.fullScreen = true;
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
         * FIXME add modestmap.addCallback('drawn', function(m){});
         * here we can update center location and zoom level display
         */
        modestmap.addCallback('drawn', function(m){
          self.controlPanel.render();
        });
        return modestmap;

      },

      /**
       * FIXME hack to add tikiman
       */
      createUserLayer: function(){

        // destroy old layer if exists...
        // FIXME use move layer
        if(this.userLayer){
          this.frame.removeLayer(this.userLayer);
        };

        var markerLayer = mapbox.markers.layer();
        this.userLayer = markerLayer;

        var center = this.world.user.get('geoLocation');
        var userData = {geometry: {coordinates: [center.coords.longitude, center.coords.latitude]}, properties: {type: 'user'}};

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

      },

      addMapLayer: function( collection ){
        /**
         * Add markers
         * mapbox lib NOT same as ModestMap
         */
        var markerLayer = mapbox.markers.layer();

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
       *k animates map to focus location
       * gets feature f
       */
      jumpToFeature: function( f ) {

        /**
         * easey interaction library for modestmaps
         */
        var mmCoordinate = this.frame.locationCoordinate({
            lat: f.get( 'lat' ),
            lon: f.get( 'lon' ) });

        /**
         * TODO document
         */
        easey().map(this.frame)
        .to(mmCoordinate)
        .zoom(this.config.maxZoom).optimal();
      },

      /**
       * delegates to modest map and
       * maybe rename
       * returns MM.Location of center
       */
      getCenter: function( ){
        return this.frame.getCenter();
      }
    });

    /**
     * UI element with information about feature
     */
    var FeatureBoxItem = Backbone.View.extend({

      className: 'featureBoxItem',

      initialize: function(){
        _.bindAll(this, 'render');

        /**
         * DOM template
         */
        this.template = featureBoxItemTemplate;
      },

     /**
      * gets model feature and index
      * and returns html
      */
      render: function(){
        var templateData = this.model.toJSON();
        this.$el.html(this.template(templateData));
        return this.el;
      },

      events: {
        "click": "setFeatureCurrent"
      },

      /**
       * sets linked Feature current
       */
      setFeatureCurrent: function( event ){
        this.model.trigger('featureboxitem:current', this );
      }
    });

    /**
     * UI element for showin mini map
     */
    var MiniMap = Backbone.View.extend({

      el: $('#minimap'),

      initialize: function(config){
        this.config = config;
      },

      render: function(){
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
        modestmap.setZoomRange(8, config.maxZoom);
        var location = new MM.Location(config.geolat, config.geolon);

        /**
         * show and zoom map
         */
        modestmap.setCenterZoom(location, 11); //FIXME hardcoded /magic number

        return modestmap;

      },

      show: function(){
        //this.$el.animate({ bottom: 10, duration: 600  });
        this.$el.fadeIn(600);
        this.visible = true;
      },

      hide: function(){
        this.$el.animate({ bottom: -250, duration: 600  });
        this.$el.fadeOut(600);
        this.visible = false;
      },

      toggle: function(){
        if(this.visible) {
          this.hide();
        } else {
          this.show();
        }
      }
    });

    /**
     * UI element with list of features
     *
     * gets collection FeatureCollection
     * gets option map
     */
    var FeatureBox = Backbone.View.extend({

      el: $('#featureBox'),
      initialize: function(){
        var self = this;
        /*
         * convienience accessor to map
         * for use in callbacks
         */
        map = this.options.map;
      },
      setFeatureCollection: function( collection ){
        this.collection = collection;

        /*
         * listens to its FeatureCollection reset event
         */
        var self = this;
        this.collection.on( 'reset', function( event, data ){
          self.render( );
        });

        // listen for focus requests from features and
        // call map for focus
        this.collection.on( 'featureboxitem:current', function( event ){
console.log({ 'featurebox:current': event })
          map.jumpToFeature( event.model );
        });

      },

      render: function(){
        var self = this;
        /**
         * Loop through each feature in the model
         * example how to add more data to the view:
         */
        _(this.collection.models).each(function(feature, index){
          feature.set( 'index', index );
          var featureBoxItem= new FeatureBoxItem({
              model: feature
          });
          var renderedTemplate = featureBoxItem.render();

          /**
           * append to backbone provided $obj
           */
          self.$el.append(renderedTemplate);

        });
      },

      show: function(){
        $(this.el).animate({ top: 60, duration: 700  });
        $(this.el).fadeIn(600);
        this.visible = true;
      },

      hide: function(){
        this.$el.animate({ top: -400, duration: 700 });
        this.$el.fadeOut(600);
        this.visible = false;
      },

      toggle: function(){
        if(this.visible) {
          this.hide();
        } else {
          this.show();
        }
      }
    });

    /** @wip
     *
     * view for Overlay Markers
     * this creates creates a marker-image element and return the reference
     * for modesmap factory the element has to exist on the dom
     * modestmap sets pointer-events to none so we have to override it
     */
    var Marker = Backbone.View.extend({

      tagName: 'div',
      className: 'markerimage',

      events: {
         "click": "featureInfoModal"
        ,"contextmenu": "markerContext"
      },

      initialize: function(){
        this.featureJson = this.options.featureJson;
        /** FIXME put into /templates
         * set icon according to index
         * set pointer-events active to override layer settings
         */
        //template: Handlebars.compile( '<img class="marker-image" src="icons/black-shield-{{index}}.png" pointer-events="auto" /> feature {{properties.title}}' ),
        this.template = Handlebars.compile( '<img src="design/icons/black-shield-{{index}}.png" pointer-events="auto" />' );
        if(this.featureJson.properties.type == 'user'){
        this.template = Handlebars.compile( '<img src="design/images/tiki-man.png" pointer-events="auto" />' );
        }
      },

      featureInfoModal: function(event) {
         console.log({ 'marker event': event, featureJson: this.featureJson }) ;
      },

      markerContext: function(event) {
         console.log({ 'marker context (right-click)': event, featureJson: this.featureJson }) ;
      },

      render: function( ) {
          this.$el.html( this.template( this.featureJson ));
          this.$el.css( 'pointer-events', 'auto' );
          return this.el;
      }
    });

    /**
     * binds to FeatureCollection reset events.
     * adds the collection to the listbox
     * draws marker with mapbox
     *
     * gets FeatureCollection as collection
     * gets reference to the map
     */
    var Overlay = Backbone.View.extend({
      initialize: function() {
          var self = this;

          this.template = featureInfoModalTemplate;

          /*
           * convienience accessor to map
           */
          this.map = this.options.map;

          /*
           * listens to its FeatureCollection reset event
           */
          this.collection.on( 'reset', function( event, data ){
            self.render( );
          });
      },

      render: function(){
          var maplayer = this.map.addMapLayer( this.collection );
      },
    });



    /**
     * UI element to show current position in botttom left
     * gets model user and binds to all changes
     */
    var StatusPanel = Backbone.View.extend({

      el: $('#statusPanel'),

      events: {
          'click #userModeWalk': 'userModeWalk'
        , 'click #userModeDrive': 'userModeDrive'
        , 'click #userOptions': 'userOptions'
      },

      initialize: function() {
        _.bindAll(this, 'render');

        var self = this;
        this.model.on('change', function () {
          self.render();
        });

        /**
         * create convienience accessors
         */
        this.user = this.model;

        this.template = statusPanelTemplate;
        this.templates = {
          'userOptions': userOptionModalTemplate
        }

      },

      show: function(){
        $(this.el).show();
        $(this.el).fadeIn(450);
        this.visible = true;
      },

      hide: function(){
        $(this.el).fadeOut(450, function() { $(self.el).hide(); });
        this.visible = false;
      },

      toggle: function(){
        if(this.visible){
          this.hide()
        } else {
          this.show()
        }
      },

      /*
       *  help the system making decisions based
       *  on the user's mode of movement
       */

      userModeWalk: function(event) {
        this.model.set( 'usermode', 'walk' );
      },

      userModeDrive: function(event) {
        this.model.set( 'usermode', 'drive' );
      },

      userOptions: function(event) {
        if($('#userOptionModal').css( 'opacity' ) === '1' ) {
          $('#userOptionModal').fadeOut(350, function() { $('#userOptionModal').hide(); });
        } else {
          $('#userOptionModal').html( this.templates.userOptions( { ui: this.ui } ) );
          $('#userOptionModal').css( { 'display': 'block'});
          $('#userOptionModal').fadeIn(350);
        }
      },

      /**
       * TODO listen on map changing it's center
       */
      render: function(){
        var templateData = { user: this.user.toJSON() };
        $(this.el).html(this.template(templateData));
        return this.el;
      }
    });

    /**
     * UI element to show map controls
     */
    var ControlPanel = Backbone.View.extend({

      el: $('#controlPanel'),

      events: {
          'click #toggleFeatureBox': 'boxToggle'
        , 'click #toggleMiniMap': 'miniMapToggle'
        , 'click #toggleFullscreen': 'fullscreenToggle'
        , 'click #geobarOptions': 'geobarOptions'
        , 'click #featureOptions': 'featureOptions'
      },

      initialize: function() {

        _.bindAll(this, 'render');

         /**
         * create convienience accessors
         */
        this.map = this.options.map;
        this.template = controlPanelTemplate;
        this.templates = {
           'geobarOptions': geobarOptionModalTemplate
          ,'featureOptions': featureOptionModalTemplate
        }

      },

      boxToggle: function(event){
        this.map.boxToggle();
      },

      miniMapToggle: function(event){
        this.map.miniMapToggle();
      },

      fullscreenToggle: function(event){
        this.map.fullscreenToggle();
      },

      geobarOptions: function(event) {
        if($('#geobarOptionModal').css( 'opacity' ) === '1' ) {
          $('#geobarOptionModal').fadeOut(350, function() { $('#geobarOptionModal').hide(); });
        } else {
          $('#geobarOptionModal').html( this.templates.geobarOptions( { ui: this.ui } ) );
          $('#geobarOptionModal').css( { 'display': 'block'});
          $('#geobarOptionModal').fadeIn(350);
        }
      },

      featureOptions: function(event){
        if($('#featureOptionModal').css( 'opacity' ) === '1' ) {
          $('#featureOptionModal').fadeOut(350, function() { $('#featureOptionModal').hide(); });
        } else {
          $('#featureOptionModal').html( this.templates.featureOptions( { ui: this.ui } ) );
          $('#featureOptionModal').css( { 'display': 'block'});
          $('#featureOptionModal').fadeIn(350);
        }
      },

      /**
       * TODO listen on map changing it's center
       */
      render: function(){
        var mapCenter = this.map.getCenter();
        var mapData = { lat: mapCenter.lat, lon: mapCenter.lon };
        var templateData = {map: mapData};
        $(this.el).html(this.template(templateData));
        return this.el;
      }
    });

    return Map;

});
