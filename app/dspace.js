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
      '!*path': 'dispatch',
    },

    parseRoute: function(path) {
      var routeParts = {};
      path.split(':').forEach(function(part) {
        var featureRoute = part.match(/^feature\/(.+)$/);
        if(featureRoute) {
          routeParts.feature = featureRoute[1]
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
      this.reset();
      var routeParts = this.parseRoute(path);
      this.parsedRoute = routeParts;
      console.log('DISPATCH', routeParts);
      for(var key in routeParts) {
        if(routeParts[key] === true) {
          this.processFlag(key);
        } else {
          this[key](routeParts[key]);
        }
      }
    },

    reset: function() {
      this.ui.reset();
    },

    feature: function(uuid) {
      console.log('load feature: ' + uuid);
    },

    processFlag: function(flag) {
      switch(flag) {
      case 'userOptions':
        this.ui.showUserOptions();
        break;
      default:
        console.error("Don't know how to handle URI flag: " + flag);
      }
    },

    addFlag: function(flag) {
      console.log('parsedRoute', JSON.stringify(this.parsedRoute));
      this.parsedRoute[flag] = true;
      this.navigate('!' + this.generateRoute(this.parsedRoute), { trigger: true });
    },

    removeFlag: function(flag) {
      delete this.parsedRoute[flag];
      this.navigate('!' + this.generateRoute(this.parsedRoute), { trigger: true });
    }

  });

});
