define([
  'underscore',
  'ender',
  'backbone',
  'models/feature',
  'views/modal/base',
  'templateMap',
  'template/helpers/renderPos'
], function(_, $, Backbone, Feature, BaseModal, templates, renderPos) {

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

      this.world = opts.world;

      this.listenTo(this.model, 'change',
                    this.updateInputs.bind(this));
      this.listenTo(this.world, 'selectedLocation:change',
                    this.updatePosition.bind(this));
      this.listenTo(this.world.aether, 'user:change',
                    this.updatePosition.bind(this));

      setTimeout(this.updatePosition.bind(this), 0);
    },

    setCollection: function(collection) {
      this.collection = collection;
    },

    render: function() {
      this.$el.html(this.template());
      setTimeout(this.updateInputs.bind(this), 0);
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

    updatePosition: function() {
      var selectedLocation = this.world.get('selectedLocation');
      if(selectedLocation) {
        this.model.set(selectedLocation);
        this.model.setLatLon();
      }
      var span = $(this.$('*[data-format=position]')[0]);
      span.attr('data-lat', this.model.get('lat'));
      span.attr('data-lon', this.model.get('lon'));
      
      // FIXME: move actual renderPos call somewhere else.
      span.html(renderPos(span.attr('data-lat'), span.attr('data-lon'), this.world.user.get('userCoordPrefs')));
    },


  });

});
