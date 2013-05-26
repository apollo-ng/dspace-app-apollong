define([
  'ender',
  'views/modal/base',
  'templateMap'
], function($, BaseModal, templates) {

  /**
   * Class: Modal.OverlayManager
   */
  var OverlayManager = BaseModal.extend({

    template: templates.overlayManager,

    sections: [],

    addSection: function(title, widget, category) {
      this.sections.push({
        title: title,
        widget: widget,
        category: category
      });
    },

    render: function() {
      var content = this.template(this.data);
      this.$el.find('#modalContent').html(content);
      this.sections.forEach(function(section) {
        this.$el.find('#omc_' + section.category).
          append(this.renderSection(section));
      }.bind(this));
    },

    renderSection: function(section) {
      var div = $("<div>");
      div.attr('class', 'overlaySection');
      div.append($('<h3>').text(section.title));
      div.append(new section.widget({ manager: this }).render());
      return div;
    },

    createOverlay: function(attributes) {
      console.log('create overlay', JSON.stringify(attributes));
      var feed = this.options.world.createFeed(attributes);
      this.options.world.addFeed(feed);
    },

    close: function() {
      this.options.ui.closeModal();
    }

  });

  return OverlayManager;

});
