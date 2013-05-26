define([
  'backbone',
  'markers',
  'views/map/marker',
  'hbs!templates/featureInfoModal'
], function(Backbone, markers, Marker, RouteLayer, FeatureInfoModalTemplate) {

  /**
   * Class: Overlay
   *
   * binds to FeatureCollection reset events.
   * adds the collection to the listbox
   * draws marker with mapbox
   *
   * gets feeds and according collections 
   * gets reference to the map
   */
  var Overlay = Backbone.View.extend({

    template: FeatureInfoModalTemplate,

    initialize: function() {

      /*
       * convienience accessor to map
       */
      this.map = this.options.map;

      this.feed = this.options.feed;

      var self = this;
      this.feed.on( 'change', function( event, data ){
        self.render( );
      });
    },

    render: function() {
      if(this.feed.get('visible')) {
        this.show();
      } else {
        this.hide();
      }
      return this;
    },

    show: function() {
      if(! this.i) {
        this.i = 1;
      }
      if(this.i >= 5) { return; }
      this.i++;
      this.hide();
      if(! this.layer) {
        if(this.feed.type === 'GPXRoute') {
          this.layer = this.makeRouteLayer();
        } else {
          this.layer = this.makeMarkerLayer();
        }
      }
      this.map.frame.addLayer(this.layer);
      this.map.frame.draw();
    },

    hide: function() {
      if(this.layer) {
        this.layer.destroy();
      }
    },

    /** 
     * create MarkerLayers
     * get featurecollection
     * returns mapbox layer 
     */
    makeMarkerLayer: function() {
      /**
       * Add markers
       * mapbox lib NOT same as ModestMap
       */
      var markerLayer = markers.layer();

      /**
       * define a factory to make markers
       */
      markerLayer.factory(function(featureJson){
        var marker = new Marker({ featureJson: featureJson, tabIndex: this.feed.index });
        return marker.render();
      }.bind(this));

      /**
       * display markers MM adds it to DOM
       * .extent() called to redraw map!
       */
      markerLayer.features( this.feed.collection.toJSON( ));
      return markerLayer;
    },

    makeRouteLayer: function() {
      return new RouteLayer(this.feed);
    },

    setExtent: function( ){
      this.map.frame.setExtent( this.layer.extent( ));
    },

  });
  return Overlay;


});
