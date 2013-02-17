define(['handlebars'], function(Handlebars) {

/**
 * Method: setAccBg
 *
 * Switch Accuracy BG depending on value
 */
  function setAccBg(acc) {
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
