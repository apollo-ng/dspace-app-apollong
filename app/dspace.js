define([
  'backbone',
  'models/world',
  'views/ui'
], function(Backbone, World, UI) {

  /**
   * Class: DSpace
   *
   * "The map is not the territory" - Alfred Korzybski
   *
   * DSpace connects the <World> with the <UI>.
   *
   * FIXME: possibly remove router
   */
  return Backbone.Router.extend({

    initialize: function(config) {
      /**
       * Property: world
       * The one and only instance of <World>.
       */
      this.world = new World({ config : config });
      /**
       * Property: ui
       * The one and only instance of <UI>.
       */
      this.ui = new UI({ world: this.world });
      this.ui.render();
    }

  });
});
