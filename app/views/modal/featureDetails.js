define([
  'underscore',
  'views/modal/base',
  'hbs!templates/featureDetails',
  'hbs!templates/featureDetailsEdit'
  
], function(_, BaseModal, showTemplate, editTemplate) {


  /**
   * Class: Modal.FeatureDetails
   */
  var FeatureDetails = BaseModal.extend({

    events: {
      'click *[data-command="save"]': 'saveAction'
    },

    initialize: function(options) {
      this.feature = options.feature;

      // actual 'data' attribute (used by BaseModal) is generated dynamically.
      this._data = {};

      switch(options.mode) {
      case 'new':
        this._data.isNew = true;
      case 'edit':
        this.template = editTemplate;
        break;
      case 'show':
      default:
        this.template = showTemplate;
      }

      this.__defineGetter__('data', function() {
        return _.extend(
          { feature: options.feature.toJSON() },
          this._data,
          options.feature.getLatLon()
        );
      });
    },

    saveAction: function() {
      var properties = {};
      this.$('#feature-form input').forEach(function(input) {
        properties[input.name] = input.value;
      });
      console.log('save', properties);
      this.feature.save({ properties: properties });
    }

  });

  return FeatureDetails;

});
