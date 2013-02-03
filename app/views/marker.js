define(['backbone'], function(Backbone) {

  /** 
   * Class: Marker
   *
   * view for Overlay Markers
   * this creates creates a marker-image element and return the reference
   * for modesmap factory the element has to exist on the dom
   * modestmap sets pointer-events to none so we have to override it
   *
   * (see marker.png)
   */
  var Marker = Backbone.View.extend({

    tagName: 'div',
    className: 'markerimage',

    events: {
      "click": "markerClick",
      "contextmenu": "markerContext"
    },

    initialize: function(){
      this.featureJson = this.options.featureJson;
    },

    markerClick: function() {
      this.trigger('click');
    },

    markerContext: function(event) {
      console.log({ 'marker context (right-click)': event, featureJson: this.featureJson }) ;
    },

    render: function( ) {
      if(this.featureJson.properties.type == 'avatar'){
        this.$el.html( '<img src="design/images/tiki-man.png" pointer-events="auto" />');
      } else {
        this.$el.addClass('shield-' + this.options.tabIndex);
        this.$el.addClass('shield-o-' + this.featureJson.index);
      }
      this.$el.css( 'pointer-events', 'auto' );
      return this.el;
    }
  });

  return Marker;

});
