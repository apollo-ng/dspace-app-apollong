$.domReady(function () {

  //get packages from ender
  var Backbone = require('backbone');
  var _ = require('underscore');

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
    setGeoJson: function(geoJSON){
      var features = geoJSON.features;
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
      easey().map(map)
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
      console.log('featureListItemView rendered');
      return this.el
    },

    events: {
            "click": "jumpToMarker"
    },

    // function for above click event to jump to a marker on the map
    jumpToMarker: function (event) {
      var coordinate = map.locationCoordinate({
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

      console.log('featureListView rendered');
    }

  });

   /*
   * UI element to show current position in botttom left
   */
  var UserView = Backbone.View.extend({
    id: 'userView',

    initialize: function(){
		console.log(this.model);
      _.bindAll(this, 'render');
      this.template = Handlebars.compile($('#userData-template').html());
    },

    render: function(){

      // temporary userData simulation, should come from user model in backbone
      var userDataJSON = this.model.toJSON();

      // add fake mapcenter to test
      userDataJSON.lat = 1;
      console.log(userDataJSON);

      $(this.el).html(this.template(userDataJSON));
      console.log('userView rendered');

      return this.el
    }

  });

  // Add Overlay-Feature-List
  window.featureCollection = new FeatureCollection();
  featureCollection.setGeoJson(window.data);
  window.featureListView = new FeatureListView({collection: featureCollection});

  // Add User View
  window.user = new User();
  user.set('coordinates', [48,11]);
  window.userView = new UserView({model: user});
  //$(this.el).html(this.template(userData));
  var renderedTemplate = userView.render();
  $('#keel').append(renderedTemplate);

  // render all
  featureListView.render();




  /*
   * Display basemap with UI
   */

  var map, mm, markers, geolat, geolon;

  var dspace_tactical =
    {
      tilejson: '1.0.0',
      scheme: 'zxy',
      tiles: ['http://192.168.1.1:8888/v2/DSpace-tactical/{z}/{x}/{y}.png']
    };

  mm = com.modestmaps;

  geolat = 48.115293;
  geolon = 11.60218;

  var map = new com.modestmaps.Map(document.getElementById('map'),
                               new wax.mm.connector(dspace_tactical), null, [
                                 easey_handlers.DragHandler(),
                                 easey_handlers.TouchHandler(),
                                 easey_handlers.MouseWheelHandler(),
                                 easey_handlers.DoubleClickHandler()
                               ]);

                               // setup boundaries
                               map.setZoomRange(13, 18);

                               // enable zoom control buttons
                               wax.mm.zoomer (map, dspace_tactical).appendTo(map.parent);

                               // show and zoom map
                               map.setCenterZoom(new mm.Location(geolat, geolon), 12);

                               map.addCallback('drawn', function(m)
                                               {
                                                 $('#zoom-indicator').html('ZOOM ' + m.getZoom().toString().substring(0,2));
                                               });

  window.map = map;

});

