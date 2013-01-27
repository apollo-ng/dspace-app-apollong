/**
 * Handlebar helper function to show coordinates
 * according to user prefs (DEC, DMS, GPS, QTH)
 * FIXME: switch according to prefs in user model
 */
define(['handlebars'], function(Handlebars) {
  function renderPos(lat, lon) {
    if ( typeof lat  !== 'undefined' && typeof lon !== 'undefined') {
      return (dd2dms(lat, 'lat') + " " + dd2dms(lon, 'lon'));
    }
  }

  Handlebars.registerHelper('renderPos', renderPos);

  return renderPos;
});
