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
     *
     */
    loadPlugins: function() {
      var pluginNames = Array.prototype.slice.call(arguments);
      var loaded = [];
      var loadedCount = 0;
      pluginNames.forEach(
        this._loadPlugin.bind(this, function(error, name, index) {
          loaded[index] = { error: error, name: name };
          loadedCount++;
          if(loadedCount === pluginNames.length) {
            this._allPluginsLoaded(loaded);
          }
        }.bind(this))
      );
    },

    // loads a plugin's code, but doesn't initialize the plugin.
    _loadPlugin: function(callback, pluginName, index) {
      console.log("Loading plugin[" + index + "]: " + pluginName);
      require(this.pluginLoadPaths(pluginName),
              this._pluginLoaded.bind(this, pluginName, callback, index),
              this._pluginFailed.bind(this, pluginName, callback, index));
    },

    // success callback for loading plugins
    _pluginLoaded: function(pluginName, callback, index) {
      console.log("Plugin[" + index + "] loaded: " + pluginName);
      callback(null, pluginName, index);
    },

    // error callback for loading plugins
    _pluginFailed: function(pluginName, callback, index, error) {
      console.error("Plugin[" + index + "] failed to load: " + pluginName,
                    ('stack' in error ? error.stack : error));
      callback(error, pluginName, index);
    },

    // callback called when all plugin code has been loaded
    _allPluginsLoaded: function(loadedPlugins) {
      loadedPlugins.forEach(function(loadedPlugin) {
        if(loadedPlugin.error) {
          // ignore error, it has already been logged.
        } else {
          this.initPlugin(loadedPlugin.name);
        }
      }.bind(this));
    },

    /**
     * Method: pluginLoadPaths
     *
     * List of paths to load via require() in order to load given plugin.
     * Currently only returns ["plugins/PLUGIN-NAME/init"].
     */
    pluginLoadPaths: function(pluginName) {
      return ['plugins/' + pluginName + '/init'];
    },

    /**
     * Property: plugins
     *
     * List of plugin definitions that have been evaluated.
     * See <plugin> for details.
     */
    plugins: [],

    // internal { pluginName : definition } map. Contains all plugins that
    // have been loaded, but not necessarily initialized.
    _plugins: {},

    /**
     * Method: plugin
     *
     * Used to implement a plugin.
     *
     * Parmeters:
     *   pluginName - name of the plugin. MUST be the exact name of the
     *                plugin's directory.
     *   definition - an Object carrying meta-information (name, description,
     *                version, authors) and hooks containing the plugin's
     *                implementation.
     *
     * Example:
     *   (start code)
     *   dspace.plugin('hello', {
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
    plugin: function(pluginName, definition) {
      this._plugins[pluginName] = definition;
    },

    /**
     * Method: initPlugin
     *
     * Perform initialization of the plugin with the given name.
     * This means attaching all it's hooks.
     * In order for this to work, the plugin code has to be loaded (see
     * _loadPlugin) and the plugin has to be declared via <plugin>.
     */
    initPlugin: function(pluginName) {
      var definition = this._plugins[pluginName];

      // object for the plugin to put global state in.
      this[pluginName] = {};

      if(! definition) {
        console.error("Can't initialize undeclared plugin: " + pluginName);
        return;
      }
      for(var key in definition.hooks) {
        this.attachHook(key, definition.hooks[key]);
      }
      // make plugin known to the rest of the world.
      this.plugins.push(definition);
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
