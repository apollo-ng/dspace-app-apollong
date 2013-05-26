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

    addSection: function(title, widget, id) {
      this.sections.push({
        id: id, //FIXME!
        title: title,
        widget: widget
      });
    },

    render: function() {
      var content = this.template(this.data);
      this.$el.find('#modalContent').html(content);
      var sectionContainer = this.$el.find('#overlaySections')
      this.sections.forEach(function(section) {
        sectionContainer.append(this.renderSection(section));
      }.bind(this));
    },

    renderSection: function(section) {
      var div = $("<div>").
        attr('id', section.id);
      div.append($('<h3>').text(section.title));
      div.append(new section.widget({ manager: this }).render());
      return div;
    }

  });

  return OverlayManager;

});
