if(typeof(Function.prototype.bind) !== 'function') {
  Function.prototype.bind = function(context) {
    var f = this;
    return function() {
      return f.apply(context, arguments);
    };
  };
}

define(['ender', './dspace', './config'], function($, DSpace, config) {

  /**
   * BIG BANG!
   */
  $.domReady(function () {
    window.dspace = new DSpace(config);
    window.world = dspace.world;
    $('#splash').fadeOut(1000, function() { $('#splash').hide(); });

    dspace.declareHook('load', function(callback) {
      setTimeout(callback, 0, world);
    });
  });

});
