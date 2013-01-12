var map, mm, markers, geolat, geolon;

// test map provider (tilestream) JSONP
var dspace_tactical =
{
	tilejson: '1.0.0',
	scheme: 'zxy',
	tiles: ['http://192.168.1.1:8888/v2/DSpace-tactical/{z}/{x}/{y}.png']
};

// another test map provider (tilestream) JSONP
var dspace_bright =
{
	tilejson: '1.0.0',
	scheme: 'zxy',
	tiles: ['http://192.168.1.1:8888/v2/DSpace/{z}/{x}/{y}.png']
};


window.onload	= function()
{
    mm 	  			= com.modestmaps;

    geolat  			= 48.115293;
    geolon 			= 11.60218;

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

    wax.mm.zoomer		(map, dspace_tactical)
	.appendTo				(map.parent)				;

/*  // Fullscreen mode, styling and testing needed!
    wax.mm.fullscreen		(map, dspace_tactical)
    .appendTo				(map.parent);
*/
    map.setCenterZoom(new com.modestmaps.Location(geolat, geolon),12);

    // Create MiniMap

    var minimap = document.getElementById('minimap');

    mmap = new com.modestmaps.Map(minimap,
                  new wax.mm.connector(dspace_tactical), null);

    mmap.setCenterZoom(new com.modestmaps.Location(geolat, geolon),11);

    // Event Listeners

    map.addCallback('drawn', function(m)
    {
        var lat = map.getCenter().toString().substring(1,7);
        var lon = map.getCenter().toString().substring(8,15);
        document.getElementById('info').innerHTML = "N: " + lat + " E: " + lon;
        document.getElementById('zoom-indicator').innerHTML = 'ZOOM ' + m.getZoom().toString().substring(0,2);
        mmap.setCenter(new mm.Location(lat,lon));
    });




    // Initiate GEOJSON test overlay

    markers = new mm.MarkerLayer();
    map.addLayer(markers);
    loadMarkers();


};




function gototest(tlat, tlon)
{
    easey().map(map)
    .to(map.locationCoordinate({ lat: tlat,  lon: tlon }))
    .zoom(18).optimal();
}


function loadMarkers()
{
    var script = document.createElement("script");
    script.src = "http://192.168.1.166/dspace/hackerspaces.gjson";
    document.getElementsByTagName("head")[0].appendChild(script);
}


function onLoadMarkers(collection)
{

    var features = collection.features,
                 len = features.length,
             extent = [];

    var n = 97; // dec value of ascii "a"

    for (var i = 0; i < len; i++)
    {
        var feature = features[i],
              marker = document.createElement("a");

        // give it a title
                marker.setAttribute("title", [
                    feature.properties.title,
                    "on", feature.properties.date_time
                ].join(" "));
                // add a class
                marker.setAttribute("class", "report");
                // set the href to link to crimespotting's crime page
                marker.setAttribute("href", "http://sanfrancisco.crimespotting.org/crime/" + [
                    feature.properties.date_time.substr(0, 10),
                    feature.properties.type.replace(/ /g, "_"),
                    feature.id
                ].join("/"));

                // create an image icon

                var letter = String.fromCharCode(n);

                var img = marker.appendChild(document.createElement("img"));
                img.setAttribute("src", "assets/icons/" + collection.icon + "-" + letter + ".png");
				img.setAttribute("class", "markerfix");

                markers.addMarker(marker, feature);
                // add the marker's location to the extent list
                extent.push(marker.location);

				// add to layer item list
				addLayerItem(feature.properties.title, feature.properties.description, feature.geometry.coordinates, collection.icon, letter );

				n++;

        }

		document.getElementById('layer-name').innerHTML = collection.name;

        map.setExtent(extent);
    }


function addLayerItem(t,d,c,i,l)
{
    var container = document.getElementById('layer-items');
    var feature = document.createElement("div");

    var lat = map.getCenter().toString().substring(1,7);
    var lon = map.getCenter().toString().substring(8,15);
    var cc = c.toString().split(",");

    var dist = distance(geolat, geolon, cc[1], cc[0], 'K');

    feature.innerHTML = '<div class="layer-item" onclick="gototest(' + cc[1] + ',' + cc[0]+ ')"><div class="' + i + '-' + l +'" ><h3>' + t + '</h3></div><div class="item-info"><div class="item-description">' + d + '</div><div class="item-dynamic"><div class="item-distance" id="item-distance-' + l + '">' + dist[0] + '<br />' + dist[1] + '</div><div class="item-position">' + c + '</div></div></div>';
    container.appendChild(feature);
}

function changeMap(z)
{
	var damap;

	if (z == 0)
	{
		damap = dspace_bright;
	}
	else
	{
		damap = dspace_tactical;
	}

    	   map = new com.modestmaps.Map(document.getElementById('map'),
               new wax.mm.connector(damap), null, [
               easey_handlers.DragHandler(),
               easey_handlers.TouchHandler(),
               easey_handlers.MouseWheelHandler(),
               easey_handlers.DoubleClickHandler()
               ]);


 // enable zoom control buttons

    wax.mm.zoomer		(map, dspace_tactical)
	.appendTo				(map.parent)				;

/*  // Fullscreen mode, styling and testing needed!
    wax.mm.fullscreen		(map, dspace_tactical)
    .appendTo				(map.parent);
*/
    map.setCenterZoom(new com.modestmaps.Location(geolat, geolon),12);

}




function distance(lat1, lon1, lat2, lon2, unit)
{
    var radlat1 = Math.PI * lat1/180
    var radlat2 = Math.PI * lat2/180
    var radlon1 = Math.PI * lon1/180
    var radlon2 = Math.PI * lon2/180
    var theta = lon1-lon2
    var radtheta = Math.PI * theta/180
    var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    dist = Math.acos(dist)
    dist = dist * 180/Math.PI
    dist = dist * 60 * 1.1515
    if (unit=="K") { dist = dist * 1.609344 }
    if (unit=="N") { dist = dist * 0.8684 }

    var result = [];

    if (dist < 1)
    {
	   result[0]=Math.round(dist * 1000);
	   result[1]="m";
	}
	else
	{
	   result[0]=Math.round(dist);
	    result[1]="&nbsp;km";
	}

    return result;
}

