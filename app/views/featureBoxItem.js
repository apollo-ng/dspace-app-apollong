define([
  'backbone', 'templateMap', 'template/helpers/renderPos',
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
     * FIXME: is (re)called even for non-active tabs, potentially expensive due to distance calculation
     * Returns:
     *
     *   el - DOM element for this view
     */
    render: function(){
      this.$el.html(this.template(_.extend(
        this.model.getLatLon(),
        { tabIndex: this.options.tab.index,
          //FIXME the chain to access the avatar/userMarker is quite long...
          distance: this.model.distanceTo(this.options.aether.user.feed.avatar),
          sector: this.model.getSector(),
        },
        this.model.toJSON()
      )));
      this.updateSettings(this.options.aether.user);
      return this.el;
    },

    events: {
      "click": "setFeatureCurrent"
    },

    initialize: function(opts) {
      opts.aether.on('user:change', this.updateSettings.bind(this));
      opts.aether.user.on('location-changed', this.render.bind(this));
      setTimeout(function() {
        this.updateSettings(opts.aether.user);
      }.bind(this), 0);
    },
    
    /**
     * Method: updateSettings
     * gets triggered on *user:change* event, to format the coords according to user preferences
     */
    updateSettings: function(user) {
      this.$('*[data-format=position]').forEach(function(e) {
        var el = this.$(e);
        el.html(renderPos(el.attr('data-lat'), el.attr('data-lon'), user.get('userCoordPrefs')));
      }.bind(this));
    },

    /**
     * Method: setFeatureCurrent
     *
     * triggers *feature:current* event on a model (<Feature>)
     */
    setFeatureCurrent: function( event ){
      this.trigger('selected', this.model);
    }
  });

  return FeatureBoxItem;

});
