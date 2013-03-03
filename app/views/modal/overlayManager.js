define([
  'views/modal/base',
  'templateMap',
  
], function(BaseModal, templates) {


  /**
   * Class: Modal.OverlayManager
   */
  var OverlayManager = BaseModal.extend({

    template: templates.overlayManager,

  });

  return OverlayManager;

});
