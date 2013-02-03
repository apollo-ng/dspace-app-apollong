define([
  'views/modal/base',
  'templateMap'
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
      console.log("FEATURE", this.feature);
    },

    close: function() {
      this.trigger('close');
    }

  });

  return FeatureDetails;

});