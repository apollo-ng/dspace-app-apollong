define([
  'models/world',
  'views/ui'
], function(World, UI) {

  /**
   * Class: DSpace
   *
   * it doesn't matter ;)
   */
  return {
    init: function(config) {
      var world = new World({ config : config });
      var ui = new UI({ world: world });
      ui.render();
      return world;
    }
  };

});
