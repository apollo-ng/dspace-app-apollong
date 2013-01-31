define(['backbone'], function(Backbone) {
  /**
   * single geographical featue of interest
   * with option to set from geoJSON feature object
   */
  var Feature = Backbone.Model.extend({

    initialize: function(){
      this.setLatLon();
    },

    /**
     * helper method for setting lat: lon: attributes from coordinates array
     */
    setLatLon: function(){
      var geometry = this.get('geometry');
      if( typeof geometry !== 'undefined'
          && geometry.coordinates
          && geometry.coordinates.length === 2 ) {
        this.set({
          lat: geometry.coordinates[1]
          , lon: geometry.coordinates[0]
        });
      }
    }
  });

  return Feature;
});
