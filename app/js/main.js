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
 * config for initializing DSpace Wrorld
 */
var config = {
  geoFeeds: [
    { name: 'Hackerspaces Munich', url: 'http://localhost:3333/hackerspaces-munich.json'},
    { name: 'OpenWiFi Munich', url: 'http://localhost:3333/openwifi-munich.json'}
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
$.domReady(function (){

  var world = new DSpace();
  world.init(config);

});

