/**
 *  Handlebar Template Helper Functions
 *  FIXME Should be outsourced in the next cleanup run
 */
Handlebars.registerHelper('shortPos', function(object) {
  if ( typeof object  !== 'undefined') {
  return new Handlebars.SafeString(
    object.toString().substring(0,6)
  );
}
});

/**
 * Handlebar helper function to show DMS coordinates
 * Example: {{ dd2dms user.geolocation.coords.latitude lat }}
 */
Handlebars.registerHelper('renderPos', function (lat, lon) {
 lat_dms = dd2dms(lat, 'lat')
 lon_dms= dd2dms(lon, 'lon')
 return (lat_dms + " " + lon_dms)
});


Handlebars.registerHelper('setAccBg', function(object) {
  if ( object > 50) {
    return ('lowAccuracy')
  } else {
    return ('highAccuracy')
  }
});


function dd2dms (decCoord, axis) {
    var sign = 1, Abs=0;
    var days, mins, secs, direction;

    if(decCoord < 0)  { sign = -1; }

    Abs = Math.abs( Math.round(decCoord * 1000000.));

    if(axis == "lat" && Abs > (90 * 1000000)) {
        return false;
    } else if(axis == "lon" && Abs > (180 * 1000000)) {
        return false;
    }

    days = Math.floor(Abs / 1000000);
    mins = Math.floor(((Abs/1000000) - days) * 60);
    secs = ( Math.floor((( ((Abs/1000000) - days) * 60) - mins) * 100000) *60/100000 ).toFixed();
    days = days * sign;

    if(axis == 'lat') direction = days<0 ? 'S' : 'N';
    if(axis == 'lon') direction = days<0 ? 'W' : 'E';

   return direction + (days * sign) + 'º ' + mins + "' " + secs + "''";
}

/**
 * X-Browser Fullscreen API Calls
 */
function reqBFS () {
  var e = document.documentElement;
  if (e.requestFullscreen) {
    e.requestFullscreen();
  } else if (e.mozRequestFullScreen) {
    e.mozRequestFullScreen();
  } else if (e.webkitRequestFullScreen) {
    e.webkitRequestFullScreen();
  }
}

function exitBFS () {
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if (document.mozCancelFullScreen) {
    document.mozCancelFullScreen();
  } else if (document.webkitCancelFullScreen) {
    document.webkitCancelFullScreen();
  }
}

/**
 *  Ugly hack to get cursor position for context menus
 */
document.onmousemove = function(e) {
  cursorX = e.pageX;
  cursorY = e.pageY;
}

/**
 * config for initializing DSpace Wrorld
 */
var config = {
  geoFeeds: [
    { name: 'Hackerspaces Munich', url: 'http://localhost:3333/hackerspaces-munich.json'},
    { name: 'OpenWiFi Munich', url: 'http://localhost:3333/openwifi-munich.json'}
  ],

  map: {
    tileSet: {
        template: 'http://dspace.ruebezahl.cc:8888/v2/DSpace-tactical/{Z}/{X}/{Y}.png'
    },
    geolat:  48.115293,
    geolon:  11.60218,
    minZoom: 13,
    maxZoom: 17,
    defaultZoom: 12
  }
};

/**
 * BIG BANG!
 */
$.domReady(function () {

  var world = new DSpace();
  world.init(config);

});

