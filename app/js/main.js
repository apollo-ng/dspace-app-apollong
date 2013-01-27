(function() {

  var requirejsConfig = {
    paths: {
      'templates'        : '../../design/templates',
      'template/helpers' : 'helpers',

      // dependencies of hbs
      'i18nprecompile'   : '../../deps/hbs/i18nprecompile',
      'json2'            : '../../deps/hbs/json2'
    },
    hbs: {
      templateExtension : 'handlebars',
      disableI18n : true
    },
  };

  // External deps in deps/
  [

    'hbs',
    'backbone',
    'underscore',
    'bonzo',
    'bean',
    'morpheus',
    'reqwest',
    'handlebars',
    'qwery',
    'modestmaps',
    'easey',
    'easey_handlers',
    'domready',
    'mapbox'

  ].forEach(function(dep) {
    requirejsConfig.paths[dep] = '../../deps/' + dep
  });

  requirejs.config(requirejsConfig);

})();

define([
  'domready',
  './dspace'
], function(domready, DSpace) {

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
    { name: 'Hackerspaces Munich', url: '/test/hackerspaces-munich.json', type: 'CORS'},
    { name: 'OpenWiFi Munich', url: '/test/openwifi-munich.json', type: 'CORS'},
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
  }
};

/**
 * BIG BANG!
 */

  domready(function () {

    console.log("loading?");

    var world = new DSpace();
    world.init(config);

  });

  console.log('main done');

});
