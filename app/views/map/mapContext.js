define([
  'ender',
  'backbone',
  'hbs!templates/mapContext'
], function($, Backbone, MapContextTemplate) {

  /**
   * Class: MapContext
   *
   * map Context menu
   *
   * (see mapContext.png)
   */
  var MapContext = Backbone.View.extend({

    el: '#mapContext',
    template: MapContextTemplate,

    events: {
      'click *[data-command]': 'callCommand',
    },

    initialize: function() {
      this.render();

      setTimeout(function() {

        dspace.declareHook('mapContextItems', function(items) {
          for(var commandName in items) {
            this.addItem(commandName, items[commandName]);
          }
        }.bind(this));

      }.bind(this), 0);
    },

    callCommand: function(event) {
      var item = this.$(event.target);
      this.trigger('command:' + item.attr('data-command'), this.point);
      this.hide();
    },

    addItem: function(command, label) {
      this.$el.append(
        $('<div class="menuItem">').
          attr('data-command', command).
          text(label)
      );
    },

    render: function() {
      this.$el.html(this.template());
      return this.el;
    },

    show: function(event){
      this.point = { x: event.clientX, y: event.clientY };
      this.$el.css( { 'left': this.point.x, 'top': this.point.y });
      this.$el.css( { 'display': 'block'});
      this.$el.fadeIn(350);
    },

    hide: function(){
      this.$el.fadeOut(350, this.$el.hide.bind(this.$el));
    }
  });

  return MapContext;
});
