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
     * FIXME document (ex deoes order matter)?
     */
    var Backbone = require('backbone');
    var _ = require('underscore');
    var Reqwest = require('reqwest');

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
          this.set({ lat: g.coordinates[1], lon: g.coordinates[0] });
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
        this.statusPanel = new StatusPanel({model: this.world.user, map: this });
        this.statusPanel.render();

        /**
         * set overlays
         */
        var self = this;

        /**
         *  create Overlays and FeatureBoxes
         */
        _(this.world.collections).each(function(featureCollection){

          this.featureBox = new FeatureBox({ collection: featureCollection, map: self });
          self.overlays.push(overlay);

          var overlay = new Overlay({ collection: featureCollection, map: self });
          self.overlays.push(overlay);
        });
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
       * animates map to focus on given feature
       */
      jumpToFeature: function( feature ) {

        /**
         * easey interaction library for modestmaps
         */
        var self = this;
        var mmCoordinate = this.frame.locationCoordinate({
          lat: feature.get('lat'),
          lon: feature.get('lon')
        });

        /**
         * TODO document
         */
        easey().map(self.frame)
        .to(mmCoordinate)
        .zoom(self.config.maxZoom).optimal();
      },

      /**
       * delegats to modest map and returns MM.Location of center
       */
      getCenter: function( ){
        return this.frame.getCenter();
      },

      /**
       * gets letter form a markers depending on a position in collection
       */
      markerLetter: function(index){

        /**
         * DEC value of ascii "a" to "z" for marker lettering
         */
        var aCharCode = 97;
        var zCharCode = 122;  //FIXME add top boundry
        var letter = String.fromCharCode(aCharCode + index);
        return letter;

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
        this.map = this.options.map;
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
         * add markerLetter passed from options
         */
        templateData.markerLetter = this.map.markerLetter(this.index);

        $(this.el).html(this.template(templateData));
        return this.el;

      },

      events: {
              "click": "jumpToMarker"
      },

      /**
       * calls map to jump to its Feature
       */
      jumpToMarker: function( event ){
        this.map.jumpToFeature(this.model); //FIXME use events!!! Backbone.Router?
      }
    });


    /**
     * UI element with list of features
     *
     * gets FeatureCollection as collection
     * gets reference to the map
     */
    var FeatureBox = Backbone.View.extend({

      el: $('#featureBox'),

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
        var self = this;

        /**
         * Loop through each feature in the model
         * example how to add more data to the view:
         *
         * The additionally passend markerLetter ends up in
         * the featureBoxItem as Options.markerLetter.
         */
        _(this.collection.models).each(function(feature, index){
          var featureBoxItem= new FeatureBoxItem({
              model: feature
            , map: self.map //FIXME - why map?
            , index: index
          });
          var renderedTemplate = featureBoxItem.render();

          /**
           * here it gets added to DOM
           * FIXME move to map
           */
          $(self.el).append(renderedTemplate);

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
          img.setAttribute('src', 'icons/black-shield-' + feature.letter + '.png');
          img.className = 'marker-image';
          return img;
        });

        /**
         * display markers
         * .extent() called to redraw map!
         */
        var jLettColl = this.jsonLetteredCollection(this.collection);
        markerLayer.features(jLettColl);
        this.map.frame.addLayer(markerLayer).setExtent(markerLayer.extent());
      },

      /**
       * returns json of collection with extra **letter** attribute
       * FIXME optimise passing models or toJSON
       */
      jsonLetteredCollection: function(collection) {

        var self = this;

        var mappedJson = _(collection.models).map( function(feature, index){
          var featureJson = feature.toJSON();
          featureJson.letter = self.map.markerLetter(index);
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
        this.map = this.options.map;

        this.template = Handlebars.compile($('#statusPanel-template').html());
      },

      /**
       * TODO listen to changes on model (User)
       * TODO listen on map changing it's center
       */
      render: function(){
        var mapCenter = this.map.getCenter();
        var mapData = { lat: mapCenter.lat, lon: mapCenter.lon };
        var templateData = {user: this.user.toJSON(), map: mapData};
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

