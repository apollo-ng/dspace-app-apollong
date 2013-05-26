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

      if(config.plugins) {
        this.loadPlugins.apply(this, config.plugins);
      }
    },

    /**
     * Method: loadPlugins
     *
     * Takes a list of plugin names and loads them asynchronously.
     */
    loadPlugins: function() {
      var pluginNames = Array.prototype.slice.call(arguments);
      pluginNames.forEach(this.loadPlugin.bind(this));
    },

    /**
     * Method: loadPlugin
     *
     * Takes the name of a single plugin and attempts to load it.
     *
     * Plugins are expected to be found in the directory "plugins/NAME/" and
     * bring at least a "init.js" file.
     */
    loadPlugin: function(pluginName) {
      console.log("Loading plugin: " + pluginName);
      require(['plugins/' + pluginName + '/init'], function() {
        console.log("Plugin loaded: " + pluginName);
      }.bind(this));
    },

    /**
     * Property: plugins
     *
     * List of plugin definitions that have been evaluated.
     * See <plugin> for details.
     */
    plugins: [],

    /**
     * Method: plugin
     *
     * Used to implement a plugin.
     *
     * Example:
     *   (start code)
     *   dspace.plugin({
     *     name: "Hello",
     *     description: "Prints a nice greeting to the console.",
     *     version: '0.1',
     *
     *     hooks: {
     *       load: function() {
     *         console.log('Hello World !');
     *       }
     *     }
     *   });
     *   (end code)
     */
    plugin: function(definition) {

      this.plugins.push(definition);

      for(var key in definition.hooks) {
        this.attachHook(key, definition.hooks[key]);
      }

    },

    /**
     * Property: hooks
     *
     * Used to store hooks.
     * Use <declareHook> to add hooks, <attachHook> to bind to them.
     */
    hooks: {},

    /**
     * Method: declareHook
     *
     * Declare a new hook.
     */
    declareHook: function(key, handler) {
      this.hooks[key] = handler;
    },

    /**
     * Method: attachHook
     *
     * Attach given `value' to the hook identified by `key'.
     * This calls the hook's handler function passed to <declareHook>.
     */
    attachHook: function(key, value) {
      var hook = this.hooks[key];
      if(typeof(hook) === 'undefined') {
        throw new Error("Unknown hook: " + key);
      }
      hook(value);
    }

  });
});
