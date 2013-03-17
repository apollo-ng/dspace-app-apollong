define([
  'underscore',
  'ender',
  'backbone',
  'models/feature',
  'views/modal/base',
  'templateMap'
], function(_, $, Backbone, Feature, BaseModal, templates) {

  /**
   * Class: Modal.AddFeature
   */
  return BaseModal.extend({

    template: templates.addFeature,

    events: {
      'click *[data-command]': 'runCommand'
    },

    initialize: function(opts) {
      this.model = new Feature();
    },

    setCollection: function(collection) {
      this.collection = collection;
    },

    commands: {
      create: function() {
        this.updateFromInputs();
        this.collection.add(this.model);
        this.trigger('close');
      },

      cancel: function() {
        this.trigger('close');
      }
    },

    runCommand: function(event) {
      var command = $(event.target).attr('data-command');
      var handler = this.commands[command];
      if(handler) {
        handler.apply(this, []);
      } else {
        console.error("No command handler installed for: ", command);
      }
    },

    updateInputs: function() {
      var properties = this.model.get('properties');
      this.findInput('properties.title').val(properties.title);
      this.findInput('properties.description').val(properties.description);
    },

    updateFromInputs: function() {
      var props = this.model.get('properties');
      this.model.set({
        properties: _.extend({
          title: this.findInput('properties.title').val(),
          description: this.findInput('properties.description').val()
        }, props)
      });
    },

    findInput: function(name) {
      return this.$('*[name="' + name + '"]');
    },

  });

});
