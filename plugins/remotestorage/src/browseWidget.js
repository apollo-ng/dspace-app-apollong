define([
  'ender',
  'backbone',
  'hbs!../templates/browseWidget'
], function($, Backbone, BrowseWidgetTemplate) {

  return Backbone.View.extend({

    template: BrowseWidgetTemplate,

    render: function() {
      return this.template({
        isConnected: dspace.remotestorage.isConnected
      });
    }

  });

});
