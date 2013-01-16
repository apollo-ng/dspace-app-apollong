/**
 *  Handlebar Template Helper Functions
 *  FIXME Should be outsourced in the next cleanup run
 */
Handlebars.registerHelper('shortPos', function(object) {
  return new Handlebars.SafeString(
    object.toString().substring(0,6)
  );
});

/**
 * BIG BANG!
 */
$.domReady(function (){

  var world = new DSpace();
  world.init();

});

