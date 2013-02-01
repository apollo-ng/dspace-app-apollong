define(['backbone'], function(Backbone) {
  /**
   * Class: Feature
   *
   * single geographical featue of interest
   * with option to set from geoJSON feature object
   *
   * (see feature.png)
   */
  var Feature = Backbone.Model.extend({

    initialize: function(){
      this.setLatLon();
    },

    /**
     * Method: setLatLon
     *
     * setting lat: lon: attributes from coordinates array
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
