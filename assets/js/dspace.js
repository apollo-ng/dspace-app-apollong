var map, mm, markers, geolat, geolon;

var dspace_tactical =
  {
    tilejson: '1.0.0',
    scheme: 'zxy',
    tiles: ['http://192.168.1.1:8888/v2/DSpace-tactical/{z}/{x}/{y}.png']
  };

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
    setLatLng: function(){
      this.set({
        lat: this.get('coordinates')[1],
        lng: this.get('coordinates')[0]
      });
    },

    /*
     * receives feature lement of geoJSON and set attributes from it
     */
    setGeoJsonFeature: function(geoJsonFeature){
      this.set({
        // array [lng, lon] from geoJSON Point
        coordinates: geoJsonFeature.geometry.coordinates,
        // object from geoJSON Feature
        properties: geoJsonFeature.properties
      });

      this.setLatLng();
    }

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
      $(this.el).html(this.template(this.model.toJSON()));
      console.log('featureListItemView rendered');
      return this.el
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
      _(this.collection.models).each(function(model){
        var featureListItemView = new FeatureListItemView({model: model});
        var renderedTemplate = featureListItemView.render();
        $(that.el).append(renderedTemplate);
      });
      console.log('featureListView rendered');
    }

  });

  window.featureCollection = new FeatureCollection();
  featureCollection.setGeoJson(window.data);
  window.featureListView = new FeatureListView({collection: featureCollection});

  // render list of features
  featureListView.render();

  /*
   * Display basemap with UI
   */

  mm = com.modestmaps;

  geolat = 48.115293;
  geolon = 11.60218;

  map = new com.modestmaps.Map(document.getElementById('map'),
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


});

