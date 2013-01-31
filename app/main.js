define(['ender', './dspace', './config', 'models/user'], function($, DSpace, config, User) {

  /**
   * BIG BANG!
   */
  $.domReady(function () {
    window.world = DSpace.init(config);
  });

});
