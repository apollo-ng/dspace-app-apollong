define(['backbone', 'templateMap'], function(Backbone, templates) {

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


  return Overlay;

});