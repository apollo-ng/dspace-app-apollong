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
        var lat = map.getCenter().toString().substring(1,7);
        var lon = map.getCenter().toString().substring(8,15);
        $('#info').html("N: " + lat + " E: " + lon);
        $('#zoom-indicator').html('ZOOM ' + m.getZoom().toString().substring(0,2));
        mmap.setCenter(new mm.Location(lat,lon));
    });


});

function addLayerItem(t,d,c,i,l)
{
    var container = $('#overlay-feature-list');
    var feature = document.createElement("div");

    var lat = map.getCenter().toString().substring(1,7);
    var lon = map.getCenter().toString().substring(8,15);
    var cc = c.toString().split(",");
	var dist = 0;//;distance(geolat, geolon, cc[1], cc[0], 'K');

    feature.innerHTML = '<div class="overlay-feature" onclick="gototest(' + cc[1] + ',' + cc[0]+ ')"><div class="' + i + '-' + l +'" ><h3>' + t + '</h3></div><div class="overlay-feature-info"><div class="overlay-feature-description">' + d + '</div><div class="item-dynamic"><div class="overlay-feature-distance" id="overlay-feature-distance-' + l + '">' + dist[0] + '<br />' + dist[1] + '</div><div class="overlay-feature-position">' + c + '</div></div></div>';
    container.append(feature);
}
