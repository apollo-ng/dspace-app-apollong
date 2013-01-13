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

  var Feature= Backbone.Model.extend({

  });

  var FeatureCollection = Backbone.Collection.extend({
    model: Feature
  });

  //set up a view
  var FeatureListView = Backbone.View.extend({
    el: $('#overlay-feature-list'),

    initialize: function(){
      _.bindAll(this, 'render');
      this.render();
      console.log("debug: initialized FeatureListView");
    },

    render: function(){
      console.log($(this.el));
      $(this.el).append("FOO");
    }

  });

  var featureListView = new FeatureListView();

  //down here is the old stuff
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
                               map.setCenterZoom(new com.modestmaps.Location(geolat, geolon),12);

                               map.addCallback('drawn', function(m)
                                               {
                                                 $('#zoom-indicator').html('ZOOM ' + m.getZoom().toString().substring(0,2));
                                                 mmap.setCenter(new mm.Location(lat,lon));
                                               });


});

