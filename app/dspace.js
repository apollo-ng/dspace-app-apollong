define([
  'backbone',

  'models/world',
  'views/ui'
], function(Backbone, World, UI) {

  function log() {
    var args = Array.prototype.slice.call(arguments);
    args.unshift('[DSpace]');
    console.log.apply(console, args);
  }

  /**
   * Class: DSpace
   *
   * it doesn't matter ;)
   *
   *
   *
   * DSpace connects the <World> with the <UI>.
   *
   * Also it's a Backbone router.
   *
   * You interact with it through <updateState>.
   */
  return Backbone.Router.extend({

    initialize: function(config) {
      log('initialize', config);
      this.world = new World({ config : config });
      this.ui = new UI({ world: this.world, dspace: this });
      this.ui.render();
      Backbone.history.start();
    },

    routes: {
      '!*query': 'dispatch'
    },

    /**
     * Method: dispatch
     *
     * Receives a query, sets up initial state and calls corresponding state
     * hooks.
     */
    dispatch: function(query) {
      log('dispatch', query);
      this.state = this.mergeState(this.defaultState, this.decodeState(query));
      this.callStateHooks(this.state);
    },

    /**
     * Property: defaultState
     *
     * Initialization for states.
     *
     */
    defaultState: {
      feature: undefined,
      modal: undefined,
      location: undefined
    },

    /**
     * Property: stateHooks
     *
     * These functions are called, when a state key is changed.
     *
     *
     * Example:
     *   (start code)
     *
     *   dspace.updateState('foo', 'bar');
     *
     *   // would call
     *
     *   dspace.stateHooks.foo('bar');
     *
     *   (end code)
     *
     */
    stateHooks: {

      feature: function(uuid) {
        this.world.set('currentFeatureId', uuid);
      },

      modal: function(name) {
        this.world.set('currentModal', name);
      },

      location: function(location) {
        var loc;
        try {
          loc = JSON.parse(location);
        } catch(exc) {};
        this.world.set('selectedLocation', loc);
      }
    },

    /**
     * Method: updateState
     *
     * Update current state and URL. Calls state hooks for all
     * attributes that are being set.
     *
     *
     * Parameters:
     *   attrs   - Object of attributes to update.
     *   replace - (optional) boolean. Indicates if this state
     *             change should create a new history item, or
     *             replace the current one.
     *
     */
    updateState: function(attrs, replace) {
      var newState = this.mergeState(this.state, attrs);
      log('updateState', this.state, '+', attrs, '->', newState);
      this.state = newState;
      this.navigate('!' + this.encodeState(newState), { replace: replace });
      this.callStateHooks(attrs);
    },

    /**
     * Method: callStateHooks
     *
     * Calls all state hooks for the given attributes.
     *
     */
    callStateHooks: function(attrs) {
      setTimeout(function() {
        for(var key in attrs) {
          console.log('callStateHook', attrs);
          var hook = this.stateHooks[key];
          if(hook) {
            hook(attrs[key]);
          }
        }
      }.bind(this), 0);
    },


    /**
     ** Section: Helpers
     **
     ** (methods without side effects)
     **
     **/


    /**
     * Method: mergeState
     *
     * Merges an "old" state with a bunch of attributes.
     *
     * Returns:
     *   a fresh state object
     */
    mergeState: function(old, attrs) {
      var newState = _.extend({}, old);
      for(var key in attrs) {
        if(typeof(attrs[key]) === 'undefined') {
          delete newState[key];
        } else {
          newState[key] = attrs[key];
        }
      }
      return newState;
    },

    /**
     * Method: decodeState
     *
     * Converts a URI-encoded state into a state Object
     *
     */
    decodeState: function(query) {
      var state = {};
      query.split('&').forEach(function(part) {
        if(part.length === 0) {
          return;
        }
        var kv = part.split('=');
        state[kv[0]] = decodeURIComponent(kv[1]);
      });
      console.log('decodeState', query, '->', state);
      return state;
    },
    
    /**
     * Method: encodeState
     *
     * Converts a state Object into a URI-encoded state.
     *
     */
    encodeState: function(state) {
      var query = [];
      for(var key in state) {
        if(typeof(state[key]) !== 'undefined') {
          query.push(key + '=' + encodeURIComponent(state[key]));
        }
      }
      var state = query.join('&');
      console.log('encodeState', state, '->', query);
      return state;
    }

  });

});
