define([
  'ender',
  'underscore',
  'backbone',
  'handlebars',

  'reqwest',

  // to the view with it 
  //'modestmaps',
  //'easey',
  //'easey_handlers',
  //'markers',

  'hbs!templates/mapContext',
  'hbs!templates/statusPanel',
  'hbs!templates/userOptionModal',
  'hbs!templates/controlPanel',
  'hbs!templates/geobarOptionModal',
  'hbs!templates/featureOptionModal',
  'hbs!templates/featureInfoModal',
  'hbs!templates/featureBoxItem'
], function( $, _, Backbone, Handlebars, Reqwest,
  mapContextTemplate, statusPanelTemplate, userOptionModalTemplate, controlPanelTemplate, geobarOptionModalTemplate, featureOptionModalTemplate, featureInfoModalTemplate, featureBoxItemTemplate
) {

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
        { name: 'Hackerspaces Munich', url: '/test/hackerspaces-munich.json', type: 'CORS'},
        { name: 'OpenWiFi Munich', url: '/test/openwifi-munich.json', type: 'CORS'},
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
        var g = this.get('geometry');
        if( typeof g !== 'undefined' && 'coordinates' in g && g.coordinates.length == 2 ) {
          this.set({ lat: g.coordinates[1], lon: g.coordinates[0] }); //FIXME
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
     * main UI logic for the Map
     */
    var Map = Backbone.View.extend({
      el: $('#map'),

      events: {
        "click": "clearAll"
        ,"contextmenu": "mapContext"
      },

      initialize: function(){
console.log( this );

          /**
           * convienience accessor
           */
          this.world = this.model;

          /**
           * listen to world changes nothing todo here yet
           */
          this.world.on( 'all', function( e, v ) {
            console.log({ world: e, v: v });
          });

          /**
           * stores config passed from world
           */
          this.config = this.options.config;
console.log( { i: this.config });
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

        console.log('new feature box!', 'map', map, 'collection', this.world.featureCollections[0]);
        this.featureBox = new FeatureBox({ map: this });
        this.featureBox.setFeatureCollection( this.world.featureCollections[0] );
        this.featureBox.visible = true;

        /**
         * create miniMap
         */
        this.miniMap = new MiniMap();
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
console.log( this );
        var config = this.options.config;

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

      addMapLayer: function( collection ){
        console.log('addMapLayer', collection);

        /**
         * Add markers
         * mapbox lib NOT same as ModestMap
         */
        var markerLayer = markers.layer();

        markerLayer.map = this.frame;

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
        setTimeout(function() {
          markerLayer.features( collection.toJSON( ));
        }, 1500);

        //this.frame.addLayer(markerLayer).setExtent(markerLayer.extent());
      },

      /**
       * animates map to focus location
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

      tagName: 'div',
      className: 'featureBoxItem',

      initialize: function(){
        _.bindAll(this, 'render');

        console.log("ELEMENT", this.el);

        // this.el = document.createElement('div');
        // this.$el = $(this.el);

        // FIXME
        this.el.setAttribute('class', 'featureBoxItem');

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
        // console.log('this element', this.el, this.$el);
        // $(this.el).html(this.template(templateData));
        this.$el.html(this.template(templateData));
        return this.el
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

      el: $('#miniMapCanvas'),

      show: function(){
        $(this.el).animate({ bottom: 10, duration: 600  });
        $(this.el).fadeIn(600);
        this.visible = true;
      },

      hide: function(){
        $(this.el).animate({ bottom: -250, duration: 600  });
        $(this.el).fadeOut(600);
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
            model: feature,
            el: document.createElement('div')
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
        $(this.el).animate({ top: -400, duration: 700 });
        $(this.el).fadeOut(600);
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
      },

      featureInfoModal: function(event) {
         console.log({ 'marker event': event, featureJson: this.featureJson }) ;
      },

      markerContext: function(event) {
         console.log({ 'marker context (right-click)': event, featureJson: this.featureJson }) ;
      },

      /** FIXME put into /templates
       * set icon according to index
       * set pointer-events active to override layer settings
       */
      //template: Handlebars.compile( '<img class="marker-image" src="icons/black-shield-{{index}}.png" pointer-events="auto" /> feature {{properties.title}}' ),
      template: Handlebars.compile( '<img src="/design/icons/black-shield-{{index}}.png" pointer-events="auto" />' ),

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
            //console.log('collection', self.collection.toJSON());
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
          //self.render();
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
        this.el.innerHTML = this.template(templateData);
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

    var World = Backbone.Model.extend({

      /**
       * Genesis ;)
       */
      initialize: function(  ){
        var self = this;
console.log( this.attributes );
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

        //@wip
        /**
         * create and render Map
         */
        this.map = new Map({model: this, config: this.get( 'map' )});
        this.map.render();
      },

      /**
       * just to notice existence of activeOverlays on a World
       */
      activeOverlays: function(){
          this.get('activeOverlays');
      }
    });

    /**
     * init() returns an instance of a World
     */
console.log( { j: config } );
    return new World( config );

  };

  /**
   * returns itself
   */
  return this;

};

  return DSpace;

});
