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

    baseMap: {
      viewurl: 'http://localhost:3333/dev-data.json',
      //viewurl: '/places/_design/gc-utils/_list/geojson/all',
      //viewurl: 'http://dspace.ruebezahl.cc:5966/places/_design/gc-utils/_list/geojson/all',
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
  var _ = require('underscore');


  /*
   * single geographical featue of interest
   * with option to set from geoJSON feature object
   */
  var Feature = Backbone.Model.extend({
    initialize: function() {
            this.setLatLon( );
    },
    /*
     * helper method for setting lat: lon: attributes from coordinates array
     */
    setLatLon: function(){
      //var g = this.get('geometry');
//console.log( this.toJSON );
      //if( 'coordinates' in g && g.coordinates.length == 2 ) {
          //this.set({ lat: g[1], lon: g[0] }); }
    },

    /*
     * receives feature element of geoJSON and set attributes from it
     */
    setGeoJsonFeature: function(geoJsonFeature){
      this.geoJsonFeature = geoJsonFeature;
      this.set({
        // array [lon, lon] from geoJSON Point
        coordinates: geoJsonFeature.geometry.coordinates,
        // object from geoJSON Feature
        properties: geoJsonFeature.properties
      });

      //this.setLatLon();
    }

  });


  /*
   * Add basic user model
   */
  var User = Backbone.Model.extend({

  });


   /*
   * collection of geographical featues
   * with option to set from geoJSON FeatureCollection
   */
  var FeatureCollection = Backbone.Collection.extend({
    model: Feature,
  });

  var Navigator = {

    maxZoomTo: window.globalOptions.maxZoom,

    /*
     * moves vieport to given coordinate
     * expects map.locationCoordinate
     */
    jumpToCoordinate: function(coordinate){

      // easey interaction library for modestmaps
      easey().map(window.map.modestmap)
      .to(coordinate)
      .zoom(this.maxZoomTo).optimal();
    }
  };

  /*
   * main UI logic for global viewport
   */
  var MapView = Backbone.View.extend({

    /*
     * renders main map
     * FIXME: add support for multiple overlays
     */
    render: function(){

      this.model.mm = this.renderBaseMap( {tileSet: globalOptions.tileSet });
      // Add User View
      //var user = new User();
      //var userView = new UserView({model: this.model });
      //var renderedTemplate = userView.render();
      //$('#keel').append(renderedTemplate);

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
console.log( {modestmap: modestmap } );
      return modestmap;
    },

    addOverlay: function(){
      // Add Overlay-Feature-List
      var markerLayer = mapbox.markers.layer();

      var markerOptions = {
        className: 'marker-image',
        iconPath: 'icons/black-shield-a.png'
      };
      var that = this;
      markerLayer.factory(function(feature){
        var img = document.createElement('img');
        img.className = that.markerOptions.className;
        img.setAttribute('src', that.markerOptions.iconPath);
        return img;
      });


      // render all
      var featureListView = new FeatureListView({collection: map.featureCollection});
      featureListView.render();

      // display markers
      markerLayer.features(map.featureCollection.features);
      this.model.modestmap.addLayer(markerLayer).setExtent(markerLayer.extent());

    },
  });

  /*
   * UI element with information about feature
   */
  var FeatureListItemView = Backbone.View.extend({
    className: 'overlay-feature-info',

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
      var coordinate = window.map.modestmap.locationCoordinate({
          lat: this.model.get('coordinates')[1]
        , lon: this.model.get('coordinates')[0]
      });

      Navigator.jumpToCoordinate(coordinate);
    }
  });


  /*
   * UI element with list of features
   */
  var FeatureListView = Backbone.View.extend({
    el: $('#overlay-feature-list'),

    initialize: function(){
      _.bindAll(this, 'render');
    },

    render: function(){
      var that = this;
      var letter = 97; // DEC value of ascii "a" for marker lettering

      /* Loop through each feature in the model
       * using underscore each. Also a good exanple
       * how to add more data to the view:
       *
       * The additionally passend markerLetter ends up in
       * the FeatureListItemView as Options.markerLetter.
       */
      _(this.collection.models).each(function(model, i){
        var markerLetter = String.fromCharCode(letter+i);
        var featureListItemView = new FeatureListItemView({model: model, markerLetter: markerLetter });
        var renderedTemplate = featureListItemView.render();

        // here it gets added to DOM
        $(that.el).append(renderedTemplate);
      });
    }

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

  var Map = Backbone.Model.extend({

    initialize: function(){
      /*
       * actual initialization and rendering of a mapView
       */

      this.view = new MapView({model: this});
      this.view.render();
      // start rendering early maybe it works
      // asyncronous request to sync featurcollection
      this.featureCollection = new FeatureCollection( );
      this.setFeatureCollection( );
    },

    /*
     * gets geoJSON and add features from it to collection
     */
    setFeatureCollection: function( ){
      var self = this;
      // request collection
      reqwest({
        url: window.globalOptions.baseMap.viewurl,
        type: 'json',
        method: 'get',
        success: function( response ) {
            

          //this.geoJson = response;
          self.featureCollection.add( response.features );

//      var featureListView = new FeatureListView({collection: map.featureCollection});
//      featureListView.render();

          var features = response.features;
//          for(var i=0; i < features.length; i++) {
//            feature = new Feature();
//            feature.setGeoJsonFeature( features[i]); 
//            that.featureCollection.add(feature);
//          };

          //that.view.addOverlay( );

        },
        failure: function( e ) {
          alert( e );
        }
      });

    }
  });


  /*
   * creating single instance of Map model for global logic
   * for now attaching it to window
   */
  var map = new Map();
  window.map = map;





});

