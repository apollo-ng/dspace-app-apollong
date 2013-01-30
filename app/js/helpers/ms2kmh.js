/**
 * Geo API delivers m/s -> convert to km/h for drive modes
 */
define(['handlebars'], function(Handlebars) {

  function ms2kmh(speed) {
    if ( typeof speed  !== 'undefined') {
      return ((speed * 3600)/1000 + 'km/h');
    } else {
      return ('0 km/h');
    }
  }

  Handlebars.registerHelper('ms2kmh', ms2kmh);

  return ms2kmh;
});