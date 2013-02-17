/**
 * Handlebar helper function to show coordinates
 * according to user prefs (DEC, DMS, GPS, QTH)
 * FIXME: switch according to prefs in user model
 */
define(['handlebars'], function(Handlebars) {


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
    if (mins < 10) {
      mins = '0' + mins;
    }
    days = days * sign;
    if(axis == 'lat') direction = days<0 ? 'S' : 'N';
    if(axis == 'lon') direction = days<0 ? 'W' : 'E';
    return direction + ' ' + (days * sign) + 'º ' + mins + "'";
  }


  function renderPos(lat, lon, prefSys) {
    if ( lat && lon) {
      switch(prefSys) {
      case 'GPS':
        return ('<span class="lat">' + dd2gps(lat, 'lat') + '</span> <span class="lon">' + dd2gps(lon, 'lon') + '</span>');
      case 'DMS':
        return ('<span class="lat">' + dd2dms(lat, 'lat') + '</span> <span class="lon">' + dd2dms(lon, 'lon') + '</span>');
      case 'DEC':
        // FIXME @chron0: print less precise numbers - it blows the FeatureBoxItem!
        return ('<span class="lat">Lat ' + lat.substr(0, 8)+ '</span> <span class="lon">Lon ' + lon.substr(0, 8) + '</span>');
      default:
        return ('<span class="lat">' + dd2gps(lat, 'lat') + '</span> <span class="lon">' + dd2gps(lon, 'lon') + '</span>');
      }
    } else {
      return ('Position not acquired');
    }
  }

  /**
   * Handlebar helper function to show coordinates
   * according to given prefs (DEC, DMS, GPS, QTH)
   */
  Handlebars.registerHelper('renderPos', renderPos);

  return renderPos;

});
