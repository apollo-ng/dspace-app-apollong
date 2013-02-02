define([
  'underscore',
  'ender',
  'backbone',
  'models/feature',
  'views/panels',
  'templateMap'
], function(_, $, Backbone, Feature, panels, templates) {

  return panels.Base.extend({

    el: '#addFeatureModal',
    template: templates.addFeature,

    initialize: function(location) {
      this.model = new Feature(location);
      console.log('addfeature', arguments);

      this.model.on('change', this.updateInputs.bind(this));
    },

    render: function() {
      this.$el.html(this.template());
      setTimeout(this.updateInputs.bind(this), 0);
    },
    
    updateInputs: function() {
      var properties = this.model.get('properties');
      var geometry = this.model.get('geometry');
      console.log("MODEL NOW", this.model);
      this.findInput('properties.type').val(properties.type);
      this.findInput('properties.title').val(properties.title);
      this.findInput('geometry.type').val(geometry.type);
      this.findInput('geometry.coordinates').val(JSON.stringify(geometry.coordinates, undefined, 2));
    },

    findInput: function(name) {
      return this.$('*[name="' + name + '"]');
    },

    showFX: function(){
      this.$el.html( this.template( { ui: this.ui } ) );
      this.$el.css( { 'display': 'block'});
      this.$el.fadeIn(350);
    },

    hideFX: function(){
      var self = this;
      this.$el.fadeOut(350, function() { self.$el.hide(); });
    }


  });

});