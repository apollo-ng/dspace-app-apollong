define(['backbone', 'templateMap'], function(Backbone, templates) {

  /**
   * Class: Overlay
   *
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

    },

    setCollection: function(collection) {
      this.collection = collection;
      setTimeout(function() {
        this.render();
      }.bind(this), 0);
    },

    render: function(){
      if(this.maplayer) {
        this.maplayer.remove();
      }
      this.maplayer = this.map.addMapLayer( this.collection );
    },
  });


  return Overlay;

});
