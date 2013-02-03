{
  name: 'node_modules/almond/almond.js',
  include: 'app/main',
  insertRequire: ['app/main'],
  out: 'build/dspace.js',
  wrap: true,

  paths: {
    // directories
    "templates"        : "design/templates",
    "template/helpers" : "app/helpers",
    "models" : "app/models",
    "collections" : "app/collections",
    "views" : "app/views",
    "templateMap" : "app/templateMap",
    "geofeeds": "app/geofeeds",
    "remoteStorage-locations": "app/remoteStorage-locations",

    // dependencies of hbs
    "i18nprecompile"   : "deps/hbs/i18nprecompile",
    "json2"            : "deps/hbs/json2",
    
    // general deps
    "hbs": "deps/hbs",
    "ender": 'deps/ender',
    "underscore": "deps/underscore",
    "backbone": "deps/backbone",
    "backbone-localstorage": "deps/backbone.localstorage",
    "Math.uuid": "deps/Math.uuid",
    "remoteStorage": "deps/remoteStorage",

    "reqwest": "deps/reqwest",
    "handlebars": "deps/handlebars",

    "modestmaps": "deps/modestmaps",
    "easey": "deps/easey",
    "easey_handlers": "deps/easey_handlers",
    "domready": "deps/domready",
    "markers": "deps/markers"
  },

  "hbs": {
    "templateExtension" : "handlebars",
    "disableI18n" : true      
  }
}
