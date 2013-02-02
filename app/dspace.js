define([
  'backbone',

  'models/world',
  'views/ui'
], function(Backbone, World, UI) {

  /**
   * Class: DSpace
   *
   * it doesn't matter ;)
   */
  return Backbone.Router.extend({

    initialize: function(config) {
      this.world = new World({ config : config });
      this.ui = new UI({ world: this.world, dspace: this });
      this.ui.render();
      Backbone.history.start();
    },

    routes: {
      '!*path': 'dispatch'
    },

    parseRoute: function(path) {
      var routeParts = {};
      path.split(':').forEach(function(part) {
        if(part.length === 0) {
          return;
        }
        var match = part.match(/^([^\/]+)\/(.+)$/);
        if(match) {
          routeParts[match[1]] = match[2];
        } else {
          routeParts[part] = true;
        }
      }.bind(this));
      return routeParts;
    },

    generateRoute: function(routeParts) {
      var pathParts = [];
      for(var key in routeParts) {
        if(routeParts[key] === true) {
          pathParts.push(key);
        } else {
          pathParts.push(key + '/' + routeParts[key]);
        }
      }
      return pathParts.join(':');
    },

    dispatch: function(path) {
      console.log('DISPATCH', path);
      this.reset();
      setTimeout(function() {
        var routeParts = this.parseRoute(path);
        this.parsedRoute = routeParts;
        for(var key in routeParts) {
          if(typeof(this[key]) === 'function') {
            this[key](routeParts[key]);
          }
        }
      }.bind(this), 0);
    },

    reset: function() {
      this.ui.reset();
      this.world.set('currentModal', undefined);
      this.world.set('currentFeatureId', undefined);
    },

    feature: function(uuid) {
      this.world.set('currentFeatureId', uuid);
    },

    modal: function(name) {
      this.world.set('currentModal', name);
    },

    jump: function(params) {
      var newParams = _.extend({}, this.parsedRoute);
      for(var key in params) {
        if(params[key]) {
          newParams[key] = params[key];
        } else {
          delete newParams[key];
        }
      }
      console.log("JUMP", JSON.stringify(newParams));
      this.navigate('!' + this.generateRoute(newParams), { trigger: true });
    }

  });

});
