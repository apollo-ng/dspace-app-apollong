define(['backbone'], function(Backbone) {

  /** 
   * Class: Marker
   *
   * view for Overlay Markers
   * this creates creates a marker-image element and return the reference
   * for modesmap factory the element has to exist on the dom
   * modestmap sets pointer-events to none so we have to override it
   */
  var Marker = Backbone.View.extend({

    tagName: 'div',
    className: 'markerimage',

    events: {
      "click": "featureInfoModal"
      ,"contextmenu": "markerContext"
    },

    initialize: function(){
      this.featureJson = this.options.featureJson;
      /**
       * set icon according to index
       * set pointer-events active to override layer settings
       */
      var html; // FIXME put into /templates
      if(this.featureJson.properties.type == 'user'){
        html =  '<img src="design/images/tiki-man.png" pointer-events="auto" />';
      } else {
        html = '<img src="design/icons/black-shield-{{index}}.png" pointer-events="auto" />';
      }
      this.template = Handlebars.compile(html);
    },

    featureInfoModal: function(event) {
      console.log({ 'marker event': event, featureJson: this.featureJson }) ;
    },

    markerContext: function(event) {
      console.log({ 'marker context (right-click)': event, featureJson: this.featureJson }) ;
    },

    render: function( ) {
      this.$el.html( this.template( this.featureJson ));
      this.$el.css( 'pointer-events', 'auto' );
      return this.el;
    }
  });

  return Marker;

});
