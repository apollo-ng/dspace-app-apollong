define(['ender', './dspace', './config'], function($, DSpace, config) {

  /**
   * BIG BANG!
   */
  $.domReady(function () {
    window.dspace = new DSpace(config);
    window.world = dspace.world;
  });

});
