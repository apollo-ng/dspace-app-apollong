define([
  'backbone',
  'remoteStorage'
], function(Backbone, remoteStorage) {

  var events = remoteStorage.util.getEventEmitter(
    'connect', 'disconnect', 'sync', 'reconnect'
  );

  var widgetView = remoteStorage.util.extend({}, events);

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
