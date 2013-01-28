/**
 * Handlebar helper function to show coordinates
 * according to user prefs (DEC, DMS, GPS, QTH)
 * FIXME: switch according to prefs in user model
 */
define(['handlebars'], function(Handlebars) {

/**
 * Handlebar helper function to show coordinates
 * according to user prefs (DEC, DMS, GPS, QTH)
 * FIXME: switch according to prefs in user model
 */
Handlebars.registerHelper('renderPos', function (lat, lon) {
  if ( typeof lat  !== 'undefined' && typeof lon !== 'undefined') {

    switch(config.user.prefCoordSys) {
      case 'GPS':
        return (dd2gps(lat, 'lat') + " - " + dd2gps(lon, 'lon'));
      case 'QTH':
        return (dd2maidenhead(lat, lon));
      case 'DMS':
        return (dd2dms(lat, 'lat') + " - " + dd2dms(lon, 'lon'));
      case 'DEC':
        return result3;
      default:
        return (dd2gps(lat, 'lat') + " - " + dd2gps(lon, 'lon'));
    }
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
 * Convert Decimal Coordinates to DM (GPS)
 */
function dd2gps (decCoord, axis) {
  var sign = 1, Abs=0;
  var days, mins, direction;

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
  mins = Math.ceil((((Abs/1000000) - days) * 60) * 1000) / 1000;;
  days = days * sign;
  if(axis == 'lat') direction = days<0 ? 'S' : 'N';
  if(axis == 'lon') direction = days<0 ? 'W' : 'E';
  return direction + (days * sign) + 'º ' + mins + "' ";
}


/**
 * Convert Decimal to Maidenhead (QTH) Locator
 * to have a human-readable and non-political "boundary"
 * sector/grid system for our world or any spherical habitat (planet)
 */
function dd2maidenhead (lat, lon) {
  var sector, i, j, div, res, lp;
  var chr  = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  var num = "0123456789";
  var k = 0;
  var t = new Array(0,0,0);
  var n    = new Array(0,0,0,0,0,0,0);
  t[1]  = (lon + 180);
  t[2]  = (lat  +  90);

  for ( i = 1; i < 3; ++i ) {
    for ( j = 1; j < 4; ++j ) {
      if ( j != 3 ) {
        if ( i == 1 ) {
          if ( j == 1 ) div = 20;
          if ( j == 2 ) div = 2;
        }

        if ( i == 2 ) {
          if ( j == 1 ) div = 10;
          if ( j == 2 ) div = 1;
        }

        res = t[i] / div;
        t[i] = res;

        if ( t[i] > 0 ) {
          lp = Math.floor(res);
        } else {
          lp = Math.ceil(res);
        }

        t[i] = (t[i] - lp) * div;

      } else {

        if ( i == 1 ) {
          div = 12;
        } else {
          div = 24;
        }

        res = t[i] * div;
        t[i] = res;

        if ( t[i] > 0 ) {
          lp = Math.floor(res);
        } else {
          lp = Math.ceil(res);
        }
      }

    ++k;
    n[k] = lp;

    }
  }
  sector = chr.charAt(n[1]) + chr.charAt(n[4]) + num.charAt(n[2]);
  sector += num.charAt(n[5]) + chr.charAt(n[3])+ chr.charAt(n[6]);
  return ('Sector: ' + sector);
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
  },

  /**
   *  FIXME: This is not supposed to be here but should be a part of the user model
   *  und should be follow be a render update of the UI, when changed.
   *  Options are: DMS, QTH (To be done: DEC & GPS)
   */
  user: {
     prefCoordSys: 'GPS'
  }
};

});
