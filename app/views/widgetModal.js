define([
  'backbone',
  'remoteStorage'
], function(Backbone, remoteStorage) {

  var events = remoteStorage.util.getEventEmitter(
    'connect', 'disconnect', 'sync', 'reconnect',
    'state' // << used internally to link widgetView -> widgetModal
  );

  var widgetView = remoteStorage.util.extend({
    display: function() {
      this.state = 'initial';
    },

    setState: function(state) {
      // TODO: change appearance of icon (spinning, offline etc)
      console.log("REMOTESTORAGE STATE", state);
      this.state = state;
      this.emit('state', state);
    },

    redirectTo: function(url) {
      document.location = url;
    },

    setUserAddress: function(userAddress) {
      // TODO: implement this if necessary.
    },

    getLocation: function() {
      return document.location.href;
    },

    setLocation: function(url) {
      document.location = url;
    }

  }, events);

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
