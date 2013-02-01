define(['backbone', 'templateMap'], function(Backbone, templates) {

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
      this.$el.html(this.template(this.model.toJSON()));
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
