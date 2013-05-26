
define([
  'views/widgetModal',
  '../lib/remotestorage',
  'hbs!../templates/settingsModal'
], function(WidgetModal, remoteStorage, SettingsTemplate) {

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
      dspace.remotestorage.isConnected = (
        state === 'connected' || state === 'busy'
      );
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

  return WidgetModal.extend({

    template: SettingsTemplate,

    events: {
      'submit #connect-form': 'connectStorage',
      'click *[data-command="sync"]': 'syncCommand',
      'click *[data-command="disconnect"]': 'disconnectCommand',
    },

    stateNames: {
      initial: 'Not connected',
      typing: 'Not connected',
      authing: 'Authenticating',
      connected: 'Connected (Idle)',
      busy:	'Connected (Syncing)',
      offline: 'Connected (Offline)',
      error: 'Connected (Sync Error)',
      unauthorized:	'Unauthorized'
    },

    postInit: function() {

      remoteStorage.widget.setView(widgetView);
      remoteStorage.claimAccess('locations', 'rw');
      remoteStorage.displayWidget();

      widgetView.on('state', function(state) {
        if(state === 'busy' || state === 'authing') {
          this.widgetBarIcon.addClass('busy');
        } else {
          this.widgetBarIcon.removeClass('busy');
        }
        this.render();
      }.bind(this));

      var origToggle = this.toggle;
      this.toggle = function() {
        origToggle.call(this);
        this.render();
      };
    },

    connectStorage: function(event) {
      event.preventDefault();
      widgetView.emit('connect', event.target.userAddress.value);
      return false;
    },

    syncCommand: function() {
      widgetView.emit('sync');
    },

    disconnectCommand: function() {
      widgetView.emit('disconnect');
    },

    templateAssigns: function() {
      var state = widgetView.state;
      return {
        state: this.stateNames[state],
        showForm: (state === 'initial' || state === 'typing'),
        showSync: (state === 'connected'),
        showDisconnect: (state === 'connected' || state === 'busy')
      };
    }

  });

});
