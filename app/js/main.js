/**
 * Handlebar helper function to show coordinates
 * according to user prefs (DEC, DMS, GPS, QTH)
 * FIXME: switch according to prefs in user model
 */
Handlebars.registerHelper('renderPos', function (lat, lon) {
  if ( typeof lat  !== 'undefined' && typeof lon !== 'undefined') {
    return (dd2dms(lat, 'lat') + " " + dd2dms(lon, 'lon'));
  }
});

/**
 *  Accuracy Helper to switch between m/km in view
 */
Handlebars.registerHelper('renderAcc', function (acc) {
  if ( typeof acc  === 'undefined') {
    return ('N/A');
} else if ( acc >= 1000 ) {
   return ( Math.round(acc/1000) + ' km');
} else {
    return ( Math.round(acc) + ' m');
}
return ret_acc
});

/**
 * Switch Accuracy BG depending on value
 */
Handlebars.registerHelper('setAccBg', function(acc) {
  if ( typeof acc  !== 'undefined') {
    if ( acc > 0 && acc <= 15 ) {
      return ('highAccuracy');
    } else if ( acc > 15 && acc < 50 ) {
      return ('medAccuracy');
    } else {
      return ('lowAccuracy');
    }
  }
});

/**
 * Convert Decimal Coordinates to DMS
 */
function dd2dms (decCoord, axis) {
  var sign = 1, Abs=0;
  var days, mins, secs, direction;

  if( decCoord < 0 ) {
    sign = -1;
  }

  Abs = Math.abs( Math.round(decCoord * 1000000.));

  if(axis == "lat" && Abs > (90 * 1000000)) {
    return false;
  } else if (axis == "lon" && Abs > (180 * 1000000)) {
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
};

/**
 * config for initializing DSpace Wrorld
 */
var config = {
  geoFeeds: [
    { name: 'OpenWiFi Munich', url: 'http://localhost:3333/openwifi-munich.json', type: 'CORS'},
    { name: 'Hackerspaces Munich', url: 'http://localhost:3333/hackerspaces-munich.json', type: 'CORS'},
    { hub: 'open-reseource.org', type: 'DSNP'}

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

