define([
  'backbone',
  'remoteStorage',
  'hbs!templates/widgetModal'
], function(Backbone, remoteStorage) {

  // SEE http://remotestoragejs.com/doc/code/files/lib/widget/default-js.html
  // FOR AN INCOMPLETE REFERENCE OF THE REMOTESTORAGE WIDGET VIEW API.

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

    initialize: function() {
      remoteStorage.claimAccess('locations', 'rw').
        then(function() {
          remoteStorage.displayWidget();
        });

      widgetView.on('state', _.bind(this.refresh, this));
    },

    refresh: function() {
      var state = widgetView.state;
      this.$el.html(this.template({
        state: state,
        showForm: (state === 'initial' || state === 'typing'),
        showSync: (state === 'connected'),
        showDisconnect: (state === 'connected' || state === 'busy')
      }));
    },

    show: function(){
      this.refresh();
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
