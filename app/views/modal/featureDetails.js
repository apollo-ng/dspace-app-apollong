define([
  'views/modal/base',
  'templateMap',
  
], function(BaseModal, templates) {


  /**
   * Class: Modal.FeatureDetails
   */
  var FeatureDetails = BaseModal.extend({

    template: templates.featureDetails,

    initialize: function(options) {
      this.data.feature = options.feature.toJSON();
      _.extend(this.data, options.feature.getLatLon());
    }
  });

  return FeatureDetails;

});
