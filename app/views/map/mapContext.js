define([
  'backbone',
  'templateMap'
], function(Backbone, templates) {

  /**
   * Class: MapContext
   *
   * map Context menu
   *
   * (see mapContext.png)
   */
  var MapContext = Backbone.View.extend({

    el: '#mapContext',
    template: templates.mapContext,

    events: {
      'click *[data-command]': 'callCommand',
    },

    initialize: function() {
      this.render();
    },

    callCommand: function(event) {
      var item = this.$(event.target);
      this.trigger('command:' + item.attr('data-command'), this.point);
      this.hide();
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
