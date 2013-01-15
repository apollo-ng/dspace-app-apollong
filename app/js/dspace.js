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

    defaultFeatureCollection: {
      viewurl: 'http://localhost:3333/dev-data.json',
      //viewurl: '/places/_design/gc-utils/_list/geojson/all',
      viewurl2: 'http://dspace.ruebezahl.cc:5966/places/_design/gc-utils/_list/geojson/all',
    },

    geolat:  48.115293,
    geolon:  11.60218,
    minZoom: 13,
    maxZoom: 17,
    defaultZoom: 12
  };

  window.globalOptions = globalOptions;


  //get packages from ender
  var Backbone = require('backbone');
  Backbone.emulateHTTP = true;

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
    },

    /*
     * renders main map
     * FIXME: add support for multiple overlays
     */
    render: function(){

      this.mm = this.renderBaseMap( {tileSet: globalOptions.tileSet });
      // Add User View
      //var user = new User();
      //var userView = new UserView({model: this.model });
      //var renderedTemplate = userView.render();
      //$('#keel').append(renderedTemplate);
      var featureBoxView = new FeatureBoxView({ collection: this.world.collections[0] });
      this.overlay = new Overlay({collection: this.world.collections[0], world: this.world });
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
  var FeatuerBoxItemView = Backbone.View.extend({
    className: 'overlay-feature-info', //FIXME: remove confusing overlays PLEASE

    initialize: function(){
      _.bindAll(this, 'render');
      this.template = Handlebars.compile($('#overlay-feature-info-template').html());
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
  var FeatureBoxView = Backbone.View.extend({
    el: $('#overlay-feature-list'),
    initialize: function(){
      var self = this;
      this.collection.on( 'reset', function( event, data ){
        self.render( );
      });
    },

    render: function(){
      var that = this;
      var letter = 97; // DEC value of ascii "a" for marker lettering

      /* Loop through each feature in the model
       * using underscore each. Also a good exanple
       * how to add more data to the view:
       *
       * The additionally passend markerLetter ends up in
       * the FeatuerBoxItemView as Options.markerLetter.
       */
      _(this.collection.models).each(function(feature, i){
        var markerLetter = String.fromCharCode(letter+i);
        var featuerBoxItemView = new FeatuerBoxItemView({model: feature, markerLetter: markerLetter });
        var renderedTemplate = featuerBoxItemView.render();

        // here it gets added to DOM
        $(that.el).append(renderedTemplate);
      });
    }
  });

  /* uses collection of Type FeatureCollection
   * and binds to its reset events.
   * gets a new marker layer from mapbox 
   */ 
  var Overlay = Backbone.View.extend({
    initialize: function(){
        this.world = this.options.world;
        var self = this;
        this.collection.on( 'reset', function( event, data ){
          self.render( );
        });
    },
    render: function(){
      //
      // Add Overlay-Feature-List
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
      markerLayer.features(this.world.collections[0].toJSON());
      this.world.map.mm.addLayer(markerLayer).setExtent(markerLayer.extent());

    },
  });

   /*
   * UI element to show current position in botttom left
   */
  var UserView = Backbone.View.extend({
    id: 'userView',

    initialize: function(){
      _.bindAll(this, 'render');
      this.template = Handlebars.compile($('#userData-template').html());
    },

    render: function(){

      // temporary userData simulation, should come from user model in backbone
      var userDataJSON = this.model.toJSON();

      // add map center
      //FIXME:userDataJSON.mapCenter = this.model.modestmap.getCenter();

      $(this.el).html(this.template(userDataJSON));

      return this.el;
    }

  });
  var FeatureCollection = Backbone.Collection.extend({
      model: Feature,
      sync: function(){
        var self = this;
        reqwest({
          url: this.url,
          success: function( response ) {
            self.reset( response.features ); },
          failure: function( e ) {
            alert( e ); }
        });
      }
    });

  var World = Backbone.Model.extend({

    initialize: function(){
      /*
       * actual initialization and rendering of a Map
       */
      this.collections = [];

      this.addFeatureCollection({ 
            url: globalOptions.defaultFeatureCollection.viewurl });
      this.addFeatureCollection({ 
            url: globalOptions.defaultFeatureCollection.viewurl2 });

      this.map = new Map({world: this});
      this.map.render();
    },
    addFeatureCollection: function( opts ){
console.log({ locationspushopts: opts });
      var features = new FeatureCollection( );
      features.url = opts.url;
      features.sync( );

      this.collections.push( features );
console.log({ locationspush: this.collections });
      return features;
    },
  });


  /*
   * creating single instance of Map model for global logic
   * for now attaching it to window
   */
  var world = new World();
  window.world = world; //FIXME: unbind!!


});

