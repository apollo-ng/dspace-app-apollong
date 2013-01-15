$.domReady(function () {

  /*
   * Display basemap with UI
   */

  var globalOptions = {

    tileSet: {
        tilejson: '1.0.0',
        scheme: 'zxy',
        tiles: ['http://dspace.ruebezahl.cc:8888/v2/DSpace-tactical/{z}/{x}/{y}.png']
    },

    geoFeeds: [

      //local files with dev eerver
    { name: 'Hackerspaces Munich', url: 'http://localhost:3333/hackerspaces-munich.json'},
    { name: 'OpenWiFi Munich', url: 'http://localhost:3333/openwifi-munich.json'}

      //local proxy
      //hackerspacesMunich: '/places/_design/gc-utils/_list/geojson/all',

      //public couchdb
      //hackerspacesMunich: 'http://dspace.ruebezahl.cc:5966/places/_design/gc-utils/_list/geojson/all',
    ],

    geolat:  48.115293,
    geolon:  11.60218,
    minZoom: 13,
    maxZoom: 17,
    defaultZoom: 12
  };

  window.globalOptions = globalOptions;

  //get packages from ender
  var Backbone = require('backbone');
  var _ = require('underscore');

  /*
   * single geographical featue of interest
   * with option to set from geoJSON feature object
   */
  var Feature = Backbone.Model.extend({
    initialize: function() {
      this.setLatLon();
    },

    /*
     * helper method for setting lat: lon: attributes from coordinates array
     */
    setLatLon: function(){
      var g = this.get('geometry');
      if( 'coordinates' in g && g.coordinates.length == 2 ) {
        this.set({ lat: g.coordinates[1], lon: g.coordinates[0] });
      }
    }
  });


  /*
   * Add basic user model
   */
  var User = Backbone.Model.extend({
    initialize: function() {
      this.world = this.get('world');
    }
      // add map center ???
      //FIXME
      //userDataJSON.mapCenter = this.user.world.map.mm.getCenter();
  });

  /*
   * main UI logic for global viewport
   */
  var Map = Backbone.View.extend({

    initialize: function(){
        /*
         * to use with map.world FIXME
         */
        this.world = this.options.world;

        // to keep track on overlays
        this.overlays = [];
    },

    /*
     * renders the main map, 
     */
    render: function(){

      this.mm = this.renderBaseMap( {tileSet: globalOptions.tileSet });

      // create FeatureBox
      this.featureBox = new FeatureBox( );

      // create StatusPanel
      // set statusPanel model to user
      this.statusPanel = new StatusPanel({model: this.world.user, map: this });
      $('#keel').append(this.statusPanel.render());

      // set overlays
      var self = this;

      _(this.world.collections).each(function(featureCollection){
        var overlay = new Overlay({ collection: featureCollection, map: self });
        self.overlays.push(overlay);
      });
    },

    renderBaseMap: function( opts ){
      var mm = com.modestmaps;
      var modestmap = new mm.Map(document.getElementById('map'),
                                 new wax.mm.connector(opts.tileSet), null, [
                                   easey_handlers.DragHandler(),
                                   easey_handlers.TouchHandler(),
                                   easey_handlers.MouseWheelHandler(),
                                   easey_handlers.DoubleClickHandler()
                                 ]);

      // setup boundaries
      modestmap.setZoomRange(globalOptions.minZoom, globalOptions.maxZoom);

      // enable zoom control buttons
      wax.mm.zoomer (modestmap, globalOptions.tileSet).appendTo(modestmap.parent);

      // show and zoom map
      modestmap.setCenterZoom(new mm.Location(globalOptions.geolat, globalOptions.geolon), globalOptions.defaultZoom);

      modestmap.addCallback('drawn', function(m)
      {
      $('#zoom-indicator').html('ZOOM ' + m.getZoom().toString().substring(0,2));
      });
      return modestmap;
    },

  });

  /*
   * UI element with information about feature
   */
  var FeatureBoxItem = Backbone.View.extend({
    className: 'featureBoxItem',

    initialize: function(){
      _.bindAll(this, 'render');
      this.template = Handlebars.compile($('#featureBoxItem-template').html());
    },

    render: function(){

      // get template data from model
      var templateData = this.model.toJSON();

      // add markerLetter passed from options
      templateData.markerLetter = this.options.markerLetter;

      $(this.el).html(this.template(templateData));
      return this.el;
    },

    events: {
            "click": "jumpToMarker"
    },

    // function for above click event to jump to a marker on the map
    jumpToMarker: function (event) {

      var lat = this.model.get('geometry').coordinates[1];
      var lon = this.model.get('geometry').coordinates[0];

      var mm = world.map.mm;
      var coordinate = mm.locationCoordinate({lat: lat, lon: lon});

      // easey interaction library for modestmaps
      easey().map(mm)
      .to(coordinate)
      .zoom(17).optimal(); //FIXME globalOptions sage
    }
  });


  /*
   * UI element with list of features
   */
  var FeatureBox = Backbone.View.extend({
    el: $('#featureBox'),
    render: function( collection ){
      var that = this;
      var lastletter = 122;  // DEC value of ascii "a" to "z" for marker lettering
      var letter = 97;


      /* Loop through each feature in the model
       * example how to add more data to the view:
       *
       * The additionally passend markerLetter ends up in
       * the featureBoxItem as Options.markerLetter.
       */
      _(collection.models).each(function(feature, i){

        var markerLetter = String.fromCharCode(letter+i);
        var featureBoxItem= new FeatureBoxItem({model: collection.models[i], markerLetter: markerLetter });
        var renderedTemplate = featureBoxItem.render();

        // here it gets added to DOM
        $(that.el).append(renderedTemplate);
      });
    }
  });

  /* binds to FeatureCollection reset events.
   * adds the collection to the listbox
   * draws marker with mapbox
   */ 
  var Overlay = Backbone.View.extend({
    initialize: function(){
        this.map = this.options.map;
        var self = this;
        this.collection.on( 'reset', function( event, data ){
          self.render( );
          self.map.featureBox.render( self.collection );
        });
    },
    render: function(){
      //
      // Add markers
      // mapbox lib NOT same as mm (modestmap)
      var markerLayer = mapbox.markers.layer();

      markerLayer.factory(function(feature){
        var img = document.createElement('img');
        img.className = 'marker-image';
        img.setAttribute('src', 'icons/black-shield-a.png');
        return img;
      });

      // display markers
      // .extent() called to redraw map!
      markerLayer.features(this.collection.toJSON());
      this.map.mm.addLayer(markerLayer).setExtent(markerLayer.extent());

    },
  });

   /*
   * UI element to show current position in botttom left
   */
  var StatusPanel = Backbone.View.extend({
    id: 'statusPanel',

    initialize: function(){
      _.bindAll(this, 'render');

      // create convienience accessor
      this.user = this.model;
      this.map = this.options.map;

      this.template = Handlebars.compile($('#statusPanel-template').html());
      //TODO listen to changes on model (User)
      //TODO listen on map changing it's center
    },

    render: function(){

      $(this.el).html(this.template(this.user.toJSON()));
      return this.el;
    }

  });
  var FeatureCollection = Backbone.Collection.extend({
      model: Feature,
      /* requests the geojson
       * resets ifselft with the result
       */
      sync: function(){
        var self = this;
        reqwest({
          url: this.url,
          success: function( response ) {
            self.reset( response.features ); },
          failure: function( e ) {
            alert( '#FIXME' ); }
        });
      }
    });

  var World = Backbone.Model.extend({
    /*
     * Genesis ;)
     */
    initialize: function(){
      var self = this;

      /**
       * create User
       */
      this.user = new User({world: this});

      /**
       * create collections of FeatureCollection
       */
      this.collections = [];

      // FIXME proper way for setting initial set of overlays
      _(globalOptions.geoFeeds).each(function(geoFeed){
        self.addFeatureCollection(geoFeed);
      });

      /**
       * create Map
       */
      this.map = new Map({world: this});
      this.map.render();
    },

    /** expects GeoFeed and returns FeatureCollection
     *
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


  /*
   * creating single instance of Map model for global logic
   * for now attaching it to window
   */
  var world = new World();
  window.world = world; //FIXME: unbind!!


});

