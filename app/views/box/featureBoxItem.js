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

    events: {
      "click": "focusOnFeature"
    },

    initialize: function(options) {
      this.aether = this.options.aether;

      this.aether.on('user:change', this.updateSettings.bind(this));
      this.aether.user.on('location-changed', this.render.bind(this));
      setTimeout(function() {
        this.updateSettings(this.aether.user);
      }.bind(this), 0);
    },

    /**
     * Method: render
     * 
     * FIXME: is (re)called even for non-active tabs, potentially expensive due to distance calculation
     * Returns:
     *
     *   el - DOM element for this view
     */
    render: function(){
      var distance = this.model.formatDistance(
        //FIXME the chain to access the avatar/userMarker is quite long...
        this.model.distanceTo(this.options.aether.user.feed.avatar)
      );
      this.$el.html(this.template(_.extend(
        this.model.getLatLon(),
        { tabIndex: this.options.tab.index,
          distance: distance,
          sector: this.model.getSector(),
        },
        this.model.toJSON()
      )));
      this.updateSettings(this.options.aether.user);
      return this.el;
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
     * Method: focusOnFeature
     *
     * triggers *feature:focus* event on <aether>
     */
    focusOnFeature: function(){
      this.aether.trigger('feature:focus', this.model);
    }
  });

  return FeatureBoxItem;

});
