$.domReady(function () {

  /*
   * Display basemap with UI
   */

  var options = {

    tileSet: {
        tilejson: '1.0.0',
        scheme: 'zxy',
        tiles: ['http://192.168.1.1:8888/v2/DSpace-tactical/{z}/{x}/{y}.png']
    },

    geolat:  48.115293,
    geolon:  11.60218,
    minZoom: 13,
    maxZoom: 18,
    defaultZoom: 12
  };

  var weaveModestMap = function(){
  var mm = com.modestmaps;
  var modestmap = new mm.Map(document.getElementById('map'),
                               new wax.mm.connector(options.tileSet), null, [
                                 easey_handlers.DragHandler(),
                                 easey_handlers.TouchHandler(),
                                 easey_handlers.MouseWheelHandler(),
                                 easey_handlers.DoubleClickHandler()
                               ]);

                               // setup boundaries
                               modestmap.setZoomRange(options.minZoom, options.maxZoom);

                               // enable zoom control buttons
                               wax.mm.zoomer (modestmap, options.tileSet).appendTo(modestmap.parent);

                               // show and zoom map
                               modestmap.setCenterZoom(new mm.Location(options.geolat, options.geolon), options.defaultZoom);

                               modestmap.addCallback('drawn', function(m)
                                               {
                                                 $('#zoom-indicator').html('ZOOM ' + m.getZoom().toString().substring(0,2));
                                               });
                                               return modestmap;
};

  //get packages from ender
  var Backbone = require('backbone');
  var _ = require('underscore');

  var Map = Backbone.Model.extend({

    initialize: function(){
      this.modestmap = weaveModestMap();
    }
  });


  /*
   * creating single instance of Map model for global logic
   * for now attaching it to window
   */
  var map = new Map();
  window.map = map;


  /*
   * single geografical featue of interest
   * with option to set from geoJSON feature object
   */
  var Feature = Backbone.Model.extend({

    /*
     * helper method for setting lat: lon: attributes from coordinates array
     */
    setLatLon: function(){
      this.set({
        lat: this.get('coordinates')[1],
        lon: this.get('coordinates')[0]
      });
    },

    /*
     * receives feature lement of geoJSON and set attributes from it
     */
    setGeoJsonFeature: function(geoJsonFeature){
      this.geoJsonFeature = geoJsonFeature;
      this.set({
        // array [lon, lon] from geoJSON Point
        coordinates: geoJsonFeature.geometry.coordinates,
        // object from geoJSON Feature
        properties: geoJsonFeature.properties
      });

      this.setLatLon();
    }

  });


  /*
   * Add basic user modell
   */
  var User = Backbone.Model.extend({

  });


   /*
   * collection of geografical featues
   * with option to set from geoJSON FeatureCollection
   */
  var FeatureCollection = Backbone.Collection.extend({
    model: Feature,

    /*
     * gets geoJSON and add features from i to collection
     */
    setGeoJson: function(geoJson){
      this.geoJson = geoJson;
      var features = geoJson.features;
      for(var i=0; i < features.length; i++) {
        feature = new Feature();
        feature.setGeoJsonFeature(features[i]);
        this.add(feature);
      };
    }
  });

  var Navigator = {

    maxZoomTo: 18,

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
      return this.el
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
       * the FeatureListItemView as options.markerLetter.
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
      userDataJSON.mapCenter = window.map.modestmap.getCenter();

      $(this.el).html(this.template(userDataJSON));

      return this.el
    }

  });

  /*
   * main UI logic for globa viewport
   */
  var MapView = Backbone.View.extend({
    initialize: function(){
      this.model = window.map;
      this.markerOptions = {
        className: 'marker-image',
        iconPath: '/assets/icons/black-shield-a.png'
      };
    },


    /*
     * renders main map
     * FIXME: add support for multiple overlays
     */
    render: function(){

      var that = this;
      // Add Overlay-Feature-List
      var featureCollection = new FeatureCollection();
      featureCollection.setGeoJson(window.data);
      var featureListView = new FeatureListView({collection: featureCollection});

      /*
       * Display markers
       */
      var markerLayer = mapbox.markers.layer();

      markerLayer.factory(function(feature){
        var img = document.createElement('img');
        img.className = that.markerOptions.className;
        img.setAttribute('src', that.markerOptions.iconPath);
        return img;
      });
      markerLayer.features(featureCollection.geoJson.features);
      this.model.modestmap.addLayer(markerLayer).setExtent(markerLayer.extent());

      // Add User View
      var user = new User();
      var userView = new UserView({model: user});
      var renderedTemplate = userView.render();
      $('#keel').append(renderedTemplate);

      // render all
      featureListView.render();
    }
  });

  /*
   * acctual initialization and rendering of a mapView
   */
  var mapView = new MapView();
  mapView.render();


});

