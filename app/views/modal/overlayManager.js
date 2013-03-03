define([
  'views/modal/base',
  'templateMap',
  
], function(BaseModal, templates) {


  /**
   * Class: Modal.OverlayManager
   */
  var OverlayManager = BaseModal.extend({

    template: templates.overlayManager,

    events: {
      'click *[data-command=close]': 'close'
    },

    close: function() {
      this.trigger('close');
    },

    render: function() {
      this.$el.html(this.template());
    },

  });

  return OverlayManager;

});
