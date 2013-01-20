/**
 * TODO document
 */
var DSpace = function(){

  /**
   * expects a config object
   * FIXME set defautls to override and don't crash if no options ;)
   */
  this.init = function ( config ){

    /**
     * require dependencies with Ender
     * FIXME document (ex does order matter)?
     */
    var Backbone = require('backbone');
    var _ = require('underscore');
    var Reqwest = require('reqwest');
    var morpheus = require('morpheus');

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
        if( 'coordinates' in g && g.coordinates.length == 2 ) {
          this.set({ lat: g.coordinates[1], lon: g.coordinates[0] }); //FIXME
        }
      }
    });


    /**
     * Add basic user model FIXME
     */
    var User = Backbone.Model.extend({

      initialize: function(){
        this.world = this.get('world');
      }
    });

    /**
     * main UI logic for the Map
     */
    var Map = Backbone.View.extend({

      initialize: function(){

          /**
           * to use with map.world FIXME
           */
          this.world = this.options.world;

          /**
           * stores config passed from world
           */
          this.config = this.options.config;

          /**
           * to keep track on overlays and feature boxes
           */
          this.overlays = [];
          this.featureBoxes = [];
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
         * create StatusPanel
         * set statusPanel model to user
         */
        this.statusPanel = new StatusPanel({model: this.world.user});
        this.statusPanel.render();

        /**
         * create ControlPanel
         * set controlPanel model to map
         */
        this.controlPanel = new ControlPanel({map: this });
        this.controlPanel.render();

        /**
         * set overlays
         */
        var self = this;

        /**
         *  create Overlays and FeatureBoxes
         */
        _(this.world.collections).each(function(featureCollection){

          this.featureBox = new FeatureBox({ collection: featureCollection, map: self });
          self.featureBoxes.push(overlay);

          var overlay = new Overlay({ collection: featureCollection, map: self });
          self.overlays.push(overlay);
        });

        //FIXME
        this.ui = {
            box: 'on'
          , miniMap:'on'
          , fullscreen: 'on'
          , animation: '350' // Animation (Fade/Tween Time in ms)
        };

        $('#featureOptionModal').hide();
        $('#geobarOptionModal').hide();

      },

      /**
       * toggles state (on/off) for #featureBox
       */
      boxToggle: function() {
        if(this.ui.box === 'on') {
          $('#featureBox').animate({ top: -400, duration: 700 });
          $('#featureBox').fadeOut(600);
          this.ui.box= 'off';
        } else {
          $('#featureBox').animate({ top: 60, duration: 700  });
          $('#featureBox').fadeIn(600);
          this.ui.box= 'on';
        }
      },

      miniMapToggle: function() {
        if(this.ui.miniMap === 'on') {
          $('#miniMapCanvas').animate({ bottom: -250, duration: 600  });
          this.ui.miniMap = 'off';
        } else {
          $('#miniMapCanvas').animate({ bottom: 10, duration: 600  });
          this.ui.miniMap = 'on';
        }
      },

      fullscreenToggle: function() {
        if(this.ui.fullscreen === 'on') {
          $('#miniMapCanvas').animate({ bottom: -250, duration: 600  });
          $('#statusPanel').fadeOut(this.ui.animation, function() { $('#statusPanel').hide(); });
          $('#featureBox').animate({ top: -400, duration: 700  });
          $('#featureBox').fadeOut(600);
          $('#map').animate({ top: 0, bottom: 0, duration: 600 });
          this.ui.box= 'off';
          this.ui.miniMap = 'off';
          this.ui.fullscreen = 'off';
        } else {
          $('#miniMapCanvas').animate({ bottom: 10, duration: 600  });
          $('#statusPanel').show();
          $('#statusPanel').fadeIn(this.ui.animation);
          $('#featureBox').animate({ top: 60, duration: 700  });
          $('#featureBox').fadeIn(600);
          $('#map').animate({ top: 50, bottom: 50, duration: 600 });
          this.ui.box= 'on';
          this.ui.miniMap = 'on';
          this.ui.fullscreen = 'on';
        }
      },

      /**
       * creates frame using ModestMaps library
       */
      createFrame: function(){
        var modestmaps = com.modestmaps;

        var config = this.config;

        var template = config.tileSet.template; //FIXME introduce BaseMap
        var layer = new MM.TemplatedLayer(template); //FIXME

        var modestmap = new modestmaps.Map('map', layer);

        /**
         *  setup boundaries
         */
        modestmap.setZoomRange(config.minZoom, config.maxZoom);
        var location = new modestmaps.Location(config.geolat, config.geolon);

        /**
         * show and zoom map
         */
        modestmap.setCenterZoom(location, config.defaultZoom);

        /**
         * FIXME add modestmap.addCallback('drawn', function(m){});
         */
        return modestmap;

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

      className: 'featureBoxItem',

      initialize: function(){
        _.bindAll(this, 'render');

        /**
         * convienience accessors
         */
        this.index = this.options.index;

        /**
         * DOM template
         */
        this.template = Handlebars.compile($('#featureBoxItem-template').html());
      },

      render: function(){

        /**
         * get template data from model
         * FIXME rethink and clarify comment
         * shuldn't need reference to map but just some util object
         */
        var templateData = this.model.toJSON();

        /**
         * add index passed from options
         */
        templateData.index = this.index;

        $(this.el).html(this.template(templateData));
        return this.el;

      },

      events: {
              "click": "setFeatureCurrent"
      },

      /**
       * sets linked Feature current
       */
      setFeatureCurrent: function( event ){
        //FIXME current wasnt bad ... maybe namespace this
        this.model.trigger('focus', this );
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

        /*
         * listens to its FeatureCollection reset event
         */
        this.collection.on( 'reset', function( event, data ){
          self.render( );
        });
        // listen for focus requests from features and
        // call map for focus
        this.collection.on( 'focus', function( event ){
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
          var featureBoxItem= new FeatureBoxItem({
              model: feature
            , index: index
          });
          var renderedTemplate = featureBoxItem.render();

          /**
           * append to backbone provided $obj
           * FIXME innerHTML for single box at a time?
	   * no, should hide the element until the update is done
           */
          self.$el.append(renderedTemplate);

        });
      }
    });

    /** @wip
     * FIXME implementing
     */
    var Marker = Backbone.View.extend({

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

      initialize: function(){
          var self = this;

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

        /**
         * Add markers
         * mapbox lib NOT same as ModestMap
         */
        var markerLayer = mapbox.markers.layer();

        /**
         * define a foctory to make markers
         * FIXME use backbone views?
         */
        markerLayer.factory(function(feature){
          var img = document.createElement('img');
          img.setAttribute('src', 'icons/black-shield-' + feature.index + '.png');
          img.className = 'marker-image';
          return img;
        });

        /**
         * display markers MM adds it to DOM
         * .extent() called to redraw map!
         */
        var jsonWithIndex = this.jsonWithIndex(this.collection);
        markerLayer.features(jsonWithIndex);
        this.map.frame.addLayer(markerLayer).setExtent(markerLayer.extent());
      },

      /**
       * returns json of collection with extra **letter** attribute
       * FIXME optimise passing models or toJSON
       */
      jsonWithIndex: function(collection) {

        var self = this;

        var mappedJson = _(collection.models).map( function(feature, index){
          var featureJson = feature.toJSON();
          featureJson.index = index;
          return featureJson;
        });
        return mappedJson;
      }
    });

    /**
     * UI element to show current position in botttom left
     */
    var StatusPanel = Backbone.View.extend({

      el: $('#statusPanel'),

      initialize: function(){
        _.bindAll(this, 'render');

        /**
         * create convienience accessors
         */
        this.user = this.model;

        this.template = Handlebars.compile($('#statusPanel-template').html());
      },

      /**
       * TODO listen to changes on model (User)
       * TODO listen on map changing it's center
       */
      render: function(){
        var templateData = {user: this.user.toJSON()};
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

        //FIXME
        this.ui = {
            featureOptionModal: 'off'
          , geobarOptionModal: 'off'
          , animation: '400' // Animation (Fade/Tween Time in ms)

        };



        /**
         * create convienience accessors
         */
        this.map = this.options.map;
        this.template = Handlebars.compile($('#controlPanel-template').html());
        this.template1 = Handlebars.compile($('#featureOptionModal-template').html());
        this.template2 = Handlebars.compile($('#geobarOptionModal-template').html());

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
        if(this.ui.geobarOptionModal === 'on') {
          $('#geobarOptionModal').fadeOut(this.ui.animation, function() { $('#geobarOptionModal').hide(); });
          this.ui.geobarOptionModal = 'off';
        } else {
          $('#geobarOptionModal').show();
          $('#geobarOptionModal').fadeIn(this.ui.animation);
          this.ui.geobarOptionModal = 'on';
        }
      },

      featureOptions: function(event){
        if(this.ui.featureOptionModal === 'on') {
          $('#featureOptionModal').fadeOut(this.ui.animation, function() { $('#featureOptionModal').hide(); });
          this.ui.featureOptionModal = 'off';
        } else {
          $('#featureOptionModal').show();
          $('#featureOptionModal').fadeIn(this.ui.animation);
          this.ui.featureOptionModal = 'on';
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

    var FeatureCollection = Backbone.Collection.extend({

      model: Feature,

      /**
       * requests the geojson
       * resets ifselft with the result
       */
      sync: function(){
        var self = this;
        var request = new Reqwest({
          url: this.url,
          type: 'json',
          success: function( response ) {
            self.reset( response.features ); },
            failure: function( e ) {
              alert( '#FIXME' ); }
        });
      }
    });

    var World = Backbone.Model.extend({

      /**
       * Genesis ;)
       */
      initialize: function( config ){
        var self = this;

        /**
         * store config
         */
        this.config = config;

        /**
         * create User
         */
        this.user = new User({world: this});

        /**
         * create collections of FeatureCollection
         */
        this.collections = [];

        /**
         * FIXME proper way for setting initial set of overlays
         */
        _(this.config.geoFeeds).each(function(geoFeed){
          self.addFeatureCollection(geoFeed);
        });

        /**
         * create and render Map
         */
        this.map = new Map({world: this, config: this.config.map});
        this.map.render();
      },

      /**
       * expects GeoFeed and returns FeatureCollection
       */
      addFeatureCollection: function( geoFeed ){
        var featureCollection = new FeatureCollection( );
        featureCollection.url = geoFeed.url; //FIXME create setGeoFeed()
        featureCollection.sync( );

        // add to world collections to keep track on!
        this.collections.push( featureCollection );
        return featureCollection;
      },
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

