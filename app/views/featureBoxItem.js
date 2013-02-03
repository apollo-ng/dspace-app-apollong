define([
  'backbone', 'templateMap', 'template/helpers/renderPos'
], function(Backbone, templates, renderPos) {

  /**
   * Class: FeatureBoxItem
   *
   * UI element with information about feature
   *
   * (see featureBoxItem.png)
   */
  var FeatureBoxItem = Backbone.View.extend({

    /**
     * Property: className
     *
     * name of a class for DOM element
     */
    className: 'featureBoxItem',

    /**
     * Property: template
     *
     * handlebars template for rendering
     */
    template: templates.featureBoxItem,

    /**
     * Method: render
     *
     * Returns:
     *
     *   el - DOM element for this view
     */
    render: function(){
      this.$el.html(this.template(_.extend(this.model.getLatLon(), this.model.toJSON())));
      return this.el;
    },

    /**
     * Event: feature:current
     *
     * triggers <setFeatureCurrent>
     */
    events: {
      "click": "setFeatureCurrent"
    },

    initialize: function(opts) {
      opts.aether.on('user:change', this.updateSettings.bind(this));
      setTimeout(function() {
        this.updateSettings(opts.aether.user);
      }.bind(this), 0);
    },

    updateSettings: function(user) {
      this.$('*[data-format=position]').forEach(function(e) {
        var el = this.$(e);
        el.html(renderPos(el.attr('data-lat'), el.attr('data-lon'), user.get('userCoordPrefs')));
      }.bind(this));
    },

    /**
     * Method: setFeatureCurrent
     *
     * trigers *feature:current* event on a model (<Feature>)
     */
    setFeatureCurrent: function( event ){
      this.model.trigger('feature:current', this.model );
    }
  });

  return FeatureBoxItem;

});
