define([
  'ender',
  'backbone',
  'hbs!templates/overlayManagerSection',
  'hbs!templates/overlayManagerSectionRow'
], function($, Backbone,
            OverlayManagerSectionTemplate,
            OverlayManagerSectionRowTemplate) {
  return Backbone.View.extend({

    template: OverlayManagerSectionTemplate,

    events: {
      'click *[data-command="open-collection"]': 'openCollection',
      'submit *[data-command="create-collection"]': 'createCollection'
    },

    render: function() {
      this.$el.html(this.template(this.options.typeDefinition));
      var colContainer = this.$('.collections');
      this.options.typeDefinition.listCollections(function(collections) {
        collections.forEach(function(col) {
          colContainer.append(OverlayManagerSectionRowTemplate(col));
        });
      });
      return this.$el;
    },

    openCollection: function(event) {
      var colName = $(event.target).attr('data-name');
      this.options.typeDefinition.getCollection(colName, function(col) {
        this.options.manager.createOverlay(col);
        this.options.manager.close();
      }.bind(this));
    },

    createCollection: function(event) {
      event.preventDefault();
      var name = event.target.name.value;
      this.options.typeDefinition.createCollection(
        name, function(col) {
          this.options.manager.createOverlay({
            name: name,
            type: 'RemoteStorage'
          });
          this.options.manager.close();
        }.bind(this));
    }


  });
});
