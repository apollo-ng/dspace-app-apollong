define([
  'backbone',
  'hbs!templates/widgetModal'
], function(Backbone, widgetModalTemplate) {

  /**
   * Class: WidgetModal
   *
   * A base class for all WidgetModals, usually implemented by plugins.
   */
  return Backbone.View.extend({
    el: '#widgetModal',

    template: widgetModalTemplate,

    initialize: function() {
      if(typeof(this.preInit) === 'function') {
        this.preInit();
      }

      // access to the icon.
      this.widgetBarIcon = this.options.widgetBarIcon;

      if(typeof(this.postInit) === 'function') {
        this.postInit();
      }
    },

    render: function() {
      this.$el.html(this.template(this.templateAssigns()));
    },

    show: function(){
      this.render();
      this.$el.css( { 'display': 'block'});
      this.$el.fadeIn(350);
      this.visible = true;
    },

    hide: function(){
      this.$el.fadeOut(350, function(){ this.$el.hide(); }.bind(this));
      this.visible = false;
    },

    toggle: function(){
      if(this.visible){
        this.hide();
      } else {
        this.show();
      }
    }

  });
});
