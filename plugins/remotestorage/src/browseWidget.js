define([
  'underscore',
  'ender',
  'backbone',
  '../lib/remotestorage-locations',
  'hbs!../templates/browseWidget',
  'hbs!../templates/collectionRow'
], function(_, $, Backbone, locations, BrowseWidgetTemplate, CollectionRowTemplate) {

  return Backbone.View.extend({

    template: BrowseWidgetTemplate,
    collectionRowTemplate: CollectionRowTemplate,

    events: {
      'submit #remotestorage-new-collection': 'createCollection',
      'click *[data-command="open-collection"]': 'openCollection'
    },

    initialize: function(options) {
      _.extend(this, options);
    },

    render: function() {
      this.$el.html(this.template({
        isConnected: dspace.remotestorage.isConnected
      }));

      locations.listCollections().then(this.renderCollections.bind(this));

      return this.$el;
    },

    createCollection: function(event) {
      event.preventDefault();
    },

    openCollection: function(event) {
      this.manager.createOverlay({
        type: 'RemoteStorage',
        name: $(event.target).attr('data-name')
      });
      this.manager.close();
    },

    renderCollections: function(collections) {
      var container = this.$('#remotestorage-collections');
      collections.forEach(function(name) {
        container.append(this.collectionRowTemplate({ name: name }));
      }.bind(this));
    }

  });

});
