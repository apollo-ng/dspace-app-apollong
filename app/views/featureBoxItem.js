define(['backbone', 'templateMap'], function(Backbone, templates) {

  /**
   * Class: FeatureBoxItem
   *
   * UI element with information about feature
   *
   * (see featureBoxItem.png)
   */
  var FeatureBoxItem = Backbone.View.extend({

    className: 'featureBoxItem',
    template: templates.featureBoxItem,

    /**
     * gets model feature and index
     * and returns html
     */
    render: function(){
      this.$el.html(this.template(this.model.toJSON()));
      return this.el;
    },

    events: {
      "click": "setFeatureCurrent"
    },

    /**
     * sets linked Feature current
     * FIXME - set on world and then listen on change?
     */
    setFeatureCurrent: function( event ){
      this.model.trigger('featureboxitem:current', this );
    }
  });

  return FeatureBoxItem;

});
