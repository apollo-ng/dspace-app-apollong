define([
  'backbone',
  'remoteStorage'
], function(Backbone, remoteStorage) {

  var widgetView = {};

  remoteStorage.widget.setView(widgetView);

  /**
   * Class: WidgetModal
   */
  return Backbone.View.extend({
    el: '#widgetModal',

    show: function(){
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
