define([
  'ender', 'underscore', 'backbone',
  'reqwest', 'easey_handlers', 'markers',
  'modestmaps',
  'models/world',

  'templateMap'
], function( $, _, Backbone, Reqwest, easey_handlers, markers, MM, World, templates) {
/**
 * TODO document
 */

var DSpace = function(){


  /**
   * expects a config object
   * FIXME set defautls to override and don't crash if no options ;) -- default in User model ?
   */
  this.init = function ( config ){

    console.log("DSpace init");








    /** @wip
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

    /**
     * binds to FeatureCollection reset events.
     * adds the collection to the listbox
     * draws marker with mapbox
     *
     * gets FeatureCollection as collection
     * gets reference to the map
     */
    var Overlay = Backbone.View.extend({

      template: templates.featureInfoModal,

      initialize: function() {

          /*
           * convienience accessor to map
           */
          this.map = this.options.map;

          var self = this;

          /*
           * listens to its FeatureCollection reset event
           */
          this.collection.on( 'reset', function( event, data ){
            self.render( );
          });
      },

      //FIXME remove old layer if exists!
      render: function(){
          var maplayer = this.map.addMapLayer( this.collection );
      },
    });


    DSpace.World = World;

    /**
     * init() returns an instance of a World
     */
    return new World( config );

  };

  /**
   * returns itself
   */
  return this;

};

  return DSpace;

});
