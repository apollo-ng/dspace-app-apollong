define([
  'ender',
  'backbone',
  'templateMap',
], function($, Backbone, templates) {

  /**
   * Class: Panel
   */
  var BasePanel = Backbone.View.extend({

    /**
     * both show() and hide() check for existence of matching FX()
     * if they exist just delegate to them!
     * sets this.visible to true
     */
    show: function() {
      if(this.showFX){
        this.showFX.apply(this, arguments);
      } else {
        this.$el.show();
      }
      this.visible = true;
    },

    hide: function() {
      if(this.hideFX){
        this.hideFX.apply(this, arguments);
      } else {
        this.$el.hide();
      }
      this.visible = false;
    },

    /**
     * checks this.visible and shows or hides panel
     */
    toggle: function(){
      if(this.visible) {
        this.hide();
      } else {
        this.show();
      }
    }
  });

  return {

    /**
     * Class: BasePanel
     *
     * extensible class for BasePanel elements
     */
    Base: BasePanel,

    /**
     * Class: MapContext
     *
     * map Context menu
     *
     * (see mapContext.png)
     */
    MapContext: BasePanel.extend({

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

      showFX: function(event){
        this.point = { x: event.clientX, y: event.clientY };
        this.$el.css( { 'left': this.point.x, 'top': this.point.y });
        this.$el.css( { 'display': 'block'});
        this.$el.fadeIn(350);
      },

      hideFX: function(){
        this.$el.fadeOut(350, this.$el.hide.bind(this.$el));
      }
    }),

    /**
     * Class: ControlPanel
     *
     * UI element to show map controls
     *
     * (see controlPanel.png)
     */
    Control: Backbone.View.extend({

      el: '#controlPanel',
      template: templates.controlPanel,

      initialize: function() {
        this.world = this.options.world;
        this.render();
      },

      render: function() {
        this.$el.html(this.template());
      },
    }),

    /**
     * Class: SideBar
     *
     * UI element for Sidebar
     *
     * (see overlaysPanel.png)
     */
    SideBar: BasePanel.extend({

      el: '#sidebar',
      fadeDuration: 450,

      showFX: function(){
        this.$el.animate({ width: 245, duration: this.fadeDuration });
        this.$el.fadeIn(this.fadeDuration);
        this.visible = true;

      },

      hideFX: function(){
        var self = this;
        this.$el.animate({ width: 0, duration: this.fadeDuration });
        this.$el.fadeOut(this.fadeDuration);
        this.visible = false;
      }
    }),
  };
});
