define(['backbone', 'markers', 'views/marker', 'templateMap'], function(Backbone, markers, Marker, templates) {

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

    template: templates.featureInfoModal,

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
      this.hide();
      this.layer = this.addMapLayer(this.feed.collection);
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
    addMapLayer: function( collection ) {
      /**
       * Add markers
       * mapbox lib NOT same as ModestMap
       */
      var markerLayer = markers.layer();

      /**
       * define a factory to make markers
       */
      markerLayer.factory(function(featureJson){
        var marker = new Marker({ featureJson: featureJson });
        marker.on('click', function() {
          this.map.trigger('marker-click', featureJson.uuid);
        }.bind(this));
        return marker.render();
      }.bind(this));
      /**
       * display markers MM adds it to DOM
       * .extent() called to redraw map!
       */
      markerLayer.features( collection.toJSON( ));
      this.map.frame.addLayer(markerLayer);
      this.map.frame.draw();
      return markerLayer;
    },

    setExtent: function( ){
      this.map.frame.setExtent( this.layer.extent( ));
    },

  });
  return Overlay;


});
