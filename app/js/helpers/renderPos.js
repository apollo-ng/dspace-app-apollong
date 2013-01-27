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

  function renderPos(lat, lon) {
    if ( typeof lat  !== 'undefined' && typeof lon !== 'undefined') {
      return (dd2dms(lat, 'lat') + " " + dd2dms(lon, 'lon'));
    }
  }

  Handlebars.registerHelper('renderPos', renderPos);

  return renderPos;
});
