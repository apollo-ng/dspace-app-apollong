define([
  'ender', 'underscore', 'backbone',
  'reqwest', 'easey_handlers', 'markers',
  'modestmaps',

  'hbs!templates/mapContext',
  'hbs!templates/featureBoxItem',
  'hbs!templates/featureInfoModal',
  'hbs!templates/userOptionModal',
  'hbs!templates/statusPanel',
  'hbs!templates/featureOptionModal',
  'hbs!templates/controlPanel'

], function( $, _, Backbone, Reqwest, easey_handlers, markers, MM,
             mapContextTemplate,
             featureBoxItemTemplate,
             featureInfoModalTemplate,
             userOptionModalTemplate,
             statusPanelTemplate,
             featureOptionModalTemplate,
             controlPanelTemplate) {
/**
 * TODO document
 */

var DSpace = function(){


  /**
   * expects a config object
   * FIXME set defautls to override and don't crash if no options ;) -- default in User model ?
   */
  this.init = function ( ){

    var config = {
      geoFeeds: [
        { name: 'OpenWiFi Munich', url: '/test/openwifi-munich.json', type: 'CORS'},
        { name: 'Hackerspaces Munich', url: '/test/hackerspaces-munich.json', type: 'CORS'},
        { hub: 'open-reseource.org', type: 'DSNP'}
      ],
    
      map: {
        tileSet: {
            template: 'http://dspace.ruebezahl.cc:8888/v2/DSpace-tactical/{Z}/{X}/{Y}.png'
        },
        geolat:  48.115293,
        geolon:  11.60218,
        minZoom: 13,
        maxZoom: 17,
        defaultZoom: 12
      }
    };

    console.log("DSpace init");

    /**
     * single geographical featue of interest
     * with option to set from geoJSON feature object
     */
    var Feature = Backbone.Model.extend({

      initialize: function(){
        this.setLatLon();
      },

      /**
       * helper method for setting lat: lon: attributes from coordinates array
       */
      setLatLon: function(){
        var geometry = this.get('geometry');
        if( typeof geometry !== 'undefined'
            && geometry.coordinates
            && geometry.coordinates.length === 2 ) {
          this.set({
              lat: geometry.coordinates[1]
            , lon: geometry.coordinates[0]
          });
        }
      }
    });
    var FeatureCollection = Backbone.Collection.extend({

      model: Feature,

      /**
       * override toJSON to adds a number to features's toJSON
       * so we can style markers with letters etc
       */
      toJSON: function( ) {
        var mappedJson = _(this.models).map( function(feature, index){
          feature.set( 'index', index );
          var featureJson = feature.toJSON();
          return featureJson;
        });
        return mappedJson;
      }

    });

    var FeatureCollectionCORS = FeatureCollection.extend({

      initialize: function( options ){
        if(options.url){
          this.url = options.url;
        }else{
          console.log('CORS with no url!');
        }
      },

      /**
       * requests the geojson
       * resets ifselft with the result
       * FIXME improve documentation
       */
      sync: function(){
        var self = this;
        var request = new Reqwest({
          url: this.url,
          type: 'json',
          success: function( response ) {
            self.reset( response.features );
          },
            failure: function( e ) {
              alert( '#FIXME' ); }
        });
      },
    });

    /**
     * Add basic user model
     */
    var User = Backbone.Model.extend({

        initialize: function() {

        this.world = this.get('world');

        /*
         * Start the geolocation
         * we bind user to update funtion to have it in callback as this
         * FIXME fallback when geolocations not allowed...
         */
        this.watch = navigator.geolocation.watchPosition (
          this._updateGeoLocation.bind(this), // FIXME: Why doesn't this work without underscores?
          this._reportGeoError.bind(this), {
            enableHighAccuracy : true
        });

        // Set a timeout in case the geolocation accuracy never meets the threshold.
        this.timeout = setTimeout(this._timeoutHandler.bind(this), 60000);

      },

      /*
       *  Update user's current geoLocation
       */
      _updateGeoLocation: function(geolocation) {
        this.set( 'geoLocation',  geolocation);
        if (geolocation.coords.accuracy < 50) {
          // FIXME: do something if this offset gets to crazy
        }
      },

      _reportGeoError: function(geolocation) {
          // FIXME: console.log(geolocation);
      },

      _timeoutHandler: function(geolocation) {
          // FIXME: console.log(geolocation);
      },

    });

    /**
     * extensible class for ModalPanel elements
     */
    var ModalPanel = Backbone.View.extend({

      /**
       * both show() and hide() check for existence of matching FX()
       * if they exist just delegate to them!
       * sets this.visible to true
       */
      show: function() {
        if(this.showFX){
          this.showFX();
        } else {
          this.$el.show();
        }
        this.visible = true;
      },

      hide: function() {
        if(this.hideFX){
          this.hideFX();
        } else {
          this.$el.hide();
        }
        this.visible = false;
      },

      /**
       * checks this.visible and shows or hides panel
       */
      toggle: function(){
        if(this.visible) {
          this.hide();
        } else {
          this.show();
        }
      }
    });

    /**
     * map ContextPanel
     */
    var ContextPanel = ModalPanel.extend({

      el: '#mapContext',
      template: mapContextTemplate,

      showFX: function(){
        this.$el.css( { 'left': cursorX, 'top': cursorY });
        this.$el.css( { 'display': 'block'});
        this.$el.fadeIn(350);
      },

      hideFX: function(){
        var self = this;
        this.$el.fadeOut(350, function() { self.$el.hide(); });
      }
    });


    /**
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

        /**
         * for managing active overlays
         */
        this.overlaysPanel = new OverlaysPanel();

        /**
         * featureBox
         */
        this.featureBox = new FeatureBox({ map: this.map, collection: this.world.featureCollections[1]});

        /**
         * creates minimap
         */
        this.miniMap = new MiniMap({world: this.world, config: this.map.config});

        /**
         * creates statusPanel
         */
        this.statusPanel = new StatusPanel({model: this.world.user});
        this.controlPanel = new ControlPanel({ ui: this, world: this.world });

        /**
         * create OptionsPanel
         */
        this.optionsPanel = new OptionsPanel();

        // for now fullscreen off by default FIXME
        this.fullScreen = false;
      },

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
      }
    });

    /**
     * main UI logic for the Map
     */
    var Map = Backbone.View.extend({

      el: '#map',

      events: {
        "click": "hideContextPanel"
        ,"contextmenu": "showContextPanel"
      },

      initialize: function(){

          this.world = this.options.world;
          this.config = this.options.config;

          var self = this;
          this.world.on('change', function(event, data){
            // WIP
            //self.recenter();
          });

          /**
           * listens to changes on user and updates related layer
           */
          this.world.user.on('change', function () {
            self.updateUserLayer();
          });

          /**
           * contextPanel for right-click / longpress
           */
          this.contextPanel = new ContextPanel({ map: this });
      },

      /**
       * Failsafe: A click on the map should clear all modal/context windows
       */
      hideContextPanel: function () {
        this.contextPanel.hide();
      },

      /**
       *  Map right-click/long touch context menu
       */
      showContextPanel: function () {
        this.contextPanel.show();
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
         * creates user layer to show current location
         */
        this.userLayer = this.createUserLayer();

        /**
         * FIXME keep track on overlays
         */
        var feeds = this.world.featureCollections;
        for( var i = feeds.length; i--; ) {
          var overlay = new Overlay({ collection: feeds[i], map: this });
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
          self.world.set('mapCenter', modestmap.getCenter());
          self.world.set('mapZoom', modestmap.getZoom());
        });

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
      }
    });

    /**
     * UI element with information about feature
     */
    var FeatureBoxItem = Backbone.View.extend({

      className: 'featureBoxItem',
      template: featureBoxItemTemplate,

     /**
      * gets model feature and index
      * and returns html
      */
      render: function(){
        this.$el.html(this.template(this.model.toJSON()));
        return this.el
      },

      events: {
        "click": "setFeatureCurrent"
      },

      /**
       * sets linked Feature current
       * FIXME - set on world and then listen on change?
       */
      setFeatureCurrent: function( event ){
        this.model.trigger('featureboxitem:current', this );
      }
    });


    /**
     * UI element for showin mini map
     */
    var MiniMap = ModalPanel.extend({

      el: '#miniMapCanvas',
      frameId: 'minimap',

      initialize: function(){

        this.world = this.options.world;
        this.config = this.options.config;

        var self = this;
        this.world.on('change', function(event, data){
          // WIP
          //self.recenter();
        });
      },

      render: function(){
        var config = this.config;

        var self = this;

        var template = config.tileSet.template; //FIXME introduce BaseMap
        var layer = new MM.TemplatedLayer(template); //FIXME fix what? @|@

        var modestmap = new MM.Map(
          this.frameId,
          layer,
          null,
          [new easey_handlers.TouchHandler(),
           new easey_handlers.DragHandler(),
           new easey_handlers.MouseWheelHandler()]
        );

        /**
         *  setup boundaries
         */
        var location = new MM.Location(config.geolat, config.geolon);

        /**
         * show and zoom map
         */
        modestmap.setCenterZoom(location, config.miniMapZoom);

        /**
         * callbacks on map redraw
         * sets current mapCenter and mapZoom
         */
        modestmap.addCallback('drawn', function(m){
          self.world.set('mapCenter', modestmap.getCenter());
        });

        this.frame = modestmap;

        return modestmap;

      },

      showFX: function(){
        this.$el.animate({ bottom: 10, duration: 600  });
        this.$el.fadeIn(600);
      },
      hideFX: function(){
        this.$el.animate({ bottom: -250, duration: 600  });
        this.$el.fadeOut(600);
      },

      recenter: function(){
        var mapCenter = this.world.get('mapCenter');
        if(mapCenter && this.frame){
          this.frame.setCenter(mapCenter);
        }
      }
    });

    /**
     * UI element with list of features
     *
     * gets collection FeatureCollection
     * gets option map
     */
    var FeatureBox = ModalPanel.extend({

      el: '#featureBox',
      initialize: function(){
        /*
         * convienience accessor to map
         * for use in callbacks
         */
        this.map = this.options.map;

        var self = this;

        // poplates box when collections load
        this.collection.on( 'reset', function( event, data ){
          self.render( );
        });

        // listen for focus requests from features and
        // call map for focus
        // FIXME bind to world.currentFeature()
        this.collection.on( 'featureboxitem:current', function( event ){
          self.map.jumpToFeature( event.model );
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

      showFX: function(){
        this.$el.animate({ top: 60, duration: 700  });
        this.$el.fadeIn(600);
      },

      hideFX: function(){
        this.$el.animate({ top: -400, duration: 700 });
        this.$el.fadeOut(600);
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
        /**
         * set icon according to index
         * set pointer-events active to override layer settings
         */
        var html; // FIXME put into /templates
        if(this.featureJson.properties.type == 'user'){
          html =  '<img src="design/images/tiki-man.png" pointer-events="auto" />';
        } else {
          html = '<img src="design/icons/black-shield-{{index}}.png" pointer-events="auto" />';
        }
        this.template = Handlebars.compile(html);
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

      template: featureInfoModalTemplate,

      initialize: function() {

          /*
           * convienience accessor to map
           */
          this.map = this.options.map;

          var self = this;

          /*
           * listens to its FeatureCollection reset event
           */
          this.collection.on( 'reset', function( event, data ){
            self.render( );
          });
      },

      //FIXME remove old layer if exists!
      render: function(){
          var maplayer = this.map.addMapLayer( this.collection );
      },
    });

    /**
     * UI element for Options
     */
    var OptionsPanel = ModalPanel.extend({

      el: '#userOptionModal',
      template: userOptionModalTemplate,

      showFX: function(){
        this.$el.html( this.template( { ui: this.ui } ) );
        this.$el.css( { 'display': 'block'});
        this.$el.fadeIn(350);
      },

      hideFX: function(){
        var self = this;
        this.$el.fadeOut(350, function() { self.$el.hide(); });
      }
    });

    /**
     * UI element to show current position in botttom left
     * gets model user and binds to all changes
     */
    var StatusPanel = ModalPanel.extend({

      el: '#statusPanel',
      template: statusPanelTemplate,

      events: {
          'click #userModeWalk': 'userModeWalk'
        , 'click #userModeDrive': 'userModeDrive'
      },

      initialize: function() {
        var self = this;
        this.model.on('change', function () {
          self.render();
        });

        /**
         * create convienience accessors
         */
        this.user = this.model;
      },

      showFX: function(){
        this.$el.show();
        this.$el.fadeIn(450);
      },

      hideFX: function(){
        var self = this;
        this.$el.fadeOut(450, function() { self.$el.hide(); });
      },

      /**
       *  help the system making decisions based
       *  on the user's mode of movement
       */

      userModeWalk: function(event) {
        this.model.set( 'usermode', 'walk' );
      },

      userModeDrive: function(event) {
        this.model.set( 'usermode', 'drive' );
      },

      render: function(){
        var templateData = { user: this.user.toJSON() };
        this.$el.html(this.template(templateData));
        return this.el;
      }
    });

    /**
     * UI element for OverlaysPanel
     */
    var OverlaysPanel = ModalPanel.extend({

      el: '#featureOptionModal',
      template: featureOptionModalTemplate,

      showFX: function(){
        this.$el.html( this.template( { ui: this.ui } ));
        this.$el.css( { 'display': 'block'});
        this.$el.fadeIn(350);
        this.visible = true;

      },

      hideFX: function(){
        var self = this;
        this.$el.fadeOut(350, function() { self.$el.hide(); });
        this.visible = false;
      }
    });

    /**
     * UI element to show map controls
     */
    var ControlPanel = Backbone.View.extend({

      el: '#controlPanel',
      template: controlPanelTemplate,

      initialize: function() {
        this.world = this.options.world

        var self = this;
        this.world.on('change', function(){
          self.render()
        });
      },

      /**
       * sets map.lat and map.lon for template
       */
      render: function(){
        var mapCenter = this.world.get('mapCenter');
        var mapData;
        if(mapCenter){
         mapData = { lat: mapCenter.lat, lon: mapCenter.lon };
        };
        var templateData = {map: mapData};
        this.$el.html(this.template(templateData));
        return this.el
      }
    });

    var World = Backbone.Model.extend({

      /**
       * Genesis ;)
       */
      initialize: function(  ){
        var self = this;
        this.geoFeeds = this.attributes.geoFeeds;

        /**
         * create User
         */
        this.user = new User({world: this});

        /**
         * create FeatureCollections
         */
          this.featureCollections = [];
          for(var i = 0; i < this.geoFeeds.length; i++){
            var feed = this.geoFeeds[i];
            switch(feed.type){
              case 'CORS':
                var featureCollection = new FeatureCollectionCORS(feed);
                //for now sync it right away!
                featureCollection.sync()

                this.featureCollections.push(featureCollection);
                break;
              default:
                console.log('tried creating ' + feed.type + ' collections')
                break;
            };
          };

        /**
         * create and render Map & UI
         */
        this.map = new Map({world: this, config: this.get( 'map' )});
        this.ui = new UI({world: this, map: this.map});

        this.map.render();
        this.ui.render();

      }
    });

    /**
     * init() returns an instance of a World
     */
    return new World( config );

  };

  /**
   * returns itself
   */
  return this;

};

  return DSpace;

});
