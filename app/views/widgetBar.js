define([
  'ender',
  'backbone'
], function($, Backbone) {

  /**
   * Class: WidgetBar
   *
   * A place to display icons etc. that open the WidgetModal or implement other
   * behaviour (such as a search box).
   *
   */
  return Backbone.View.extend({

    el: '#widgetBar',

    initialize: function() {
      setTimeout(function() {
        dspace.declareHook('widgetBarIcon', this.addIcon.bind(this));
        dspace.declareHook('widgetBarElement', this.addElement.bind(this));
      }.bind(this));
    },

    addElement: function(el) {
      this.$el.append(typeof(el.render) === 'function' ? el.render() : el)
    },

    addIcon: function(options) {
      this.addElement(this.renderIcon(options));
    },

    renderIcon: function(options) {
      var wrapper = $('<div>').attr('class', 'widgetIcon');
      wrapper.append($('<img>').attr('src', options.src));

      if(options.modal) {
        var modal = new options.modal();

        options.action = function() {
          modal.toggle();
        };
      }
      
      if(options.action) {
        wrapper.on('click', options.action);
      }

      return wrapper;
    }

  });

});
