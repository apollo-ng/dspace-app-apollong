define([
  'ender',
  'views/modal/base',
  'views/modal/overlayManagerSection',
  'hbs!templates/overlayManager'
], function($, BaseModal, OverlayManagerSection, OverlayManagerTemplate) {

  /**
   * Class: Modal.OverlayManager
   */
  var OverlayManager = BaseModal.extend({

    template: OverlayManagerTemplate,

    types: [],

    // a type must have at least:
    //   * name:
    //     human readable name of type
    //   * category:
    //     column to display collections in ("private" or "public")
    //   * listCollections(callback):
    //     a method to asynchronously get a list of collections of given type
    //
    // and optionally:
    //   * writable:
    //     boolean, whether this collection is writable
    //   * createCollection(name, callback):
    //     method to create a new collection (only if writable == true)
    registerType: function(definition) {
      this.types.push(definition);
    },

    render: function() {
      var content = this.template(this.data);
      var contentContainer = this.$el.find('#modalContent');
      contentContainer.html(content);
      var categoryContainers = {
        'public': contentContainer.find('#omc_public'),
        'private': contentContainer.find('#omc_private')
      };
      this.types.forEach(function(typeDef) {
        var section = new OverlayManagerSection({
          typeDefinition: typeDef,
          manager: this
        });
        categoryContainers[typeDef.category].append(section.render());
      }.bind(this));
    },

    createOverlay: function(attributes) {
      var feed = this.options.world.createFeed(attributes);
      this.options.world.addFeed(feed, true);
    },

    close: function() {
      this.options.ui.closeModal();
    }

  });

  return OverlayManager;

});
