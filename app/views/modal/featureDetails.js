define([
  'views/modal/base',
  'templateMap',
  
], function(BaseModal, templates) {


  /**
   * Class: Modal.FeatureDetails
   */
  var FeatureDetails = BaseModal.extend({

    template: templates.featureDetails,

    events: {
      'click *[data-command=close]': 'close'
    },

    initialize: function(options) {
      this.feature = options.feature.toJSON();
      _.extend(this, options.feature.getLatLon());
    },

    close: function() {
      this.trigger('close');
    }

  });

  return FeatureDetails;

});
