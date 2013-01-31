define([
  'models/world'
], function(World) {

  /**
   * Class: DSpace
   *
   * it doesn't matter ;)
   */
  return {
    init: function(config) {
      return new World({ config : config });
    }
  };

});
