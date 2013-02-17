define(['handlebars'], function(Handlebars) {

/**
 * Method: renderAcc
 *
 *  Accuracy Helper to switch between m/km in view
 */
  function renderAcc(acc) {
    if ( typeof acc  === 'undefined') {
      return ('N/A');
    } else if ( acc >= 1000 ) {
      return ( Math.round(acc/1000) + ' km');
    } else {
      return ( Math.round(acc) + ' m');
    }
    return ret_acc
  }

  Handlebars.registerHelper('renderAcc', renderAcc);

  return renderAcc;
});
