define(['ender', './dspace', './config'], function($, DSpace, config) {

  /**
   * BIG BANG!
   */
  $.domReady(function () {
    window.world = DSpace.init(config);
  });

});
