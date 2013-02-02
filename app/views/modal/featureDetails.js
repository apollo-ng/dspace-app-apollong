define([
  'views/modal/base',
  'templateMap'
], function(BaseModal, templates) {

  var FeatureDetails = BaseModal.extend({

    template: templates.featureDetails,

    initialize: function(options) {
      this.feature = options.feature.toJSON();
      console.log("FEATURE", this.feature);
    }

  });

  return FeatureDetails;

});