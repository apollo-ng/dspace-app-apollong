/**
 * Switch Accuracy BG depending on value
 */
define(['handlebars'], function(Handlebars) {

  function setAccBg(object) {
    if ( typeof acc  !== 'undefined') {
      if ( acc > 0 && acc <= 15 ) {
        return ('highAccuracy');
      } else if ( acc > 15 && acc < 50 ) {
        return ('medAccuracy');
      } else {
        return ('lowAccuracy');
      }
    }
  }

  Handlebars.registerHelper('setAccBg', setAccBg);

  return setAccBg;

});