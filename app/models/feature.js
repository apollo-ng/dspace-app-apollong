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

    initialize: function(location){
      if(location) {
        this.set(location);
      }
      this.setLatLon();

      if(! this.get('properties')) {
        this.set('properties', {});
      }

      if(! this.get('geometry')) {
        this.set('geometry', {});
      }
    },

    /**
     * Method: setLatLon
     *
     * setting lat: lon: attributes from coordinates array
     */
    setLatLon: function(){
      var geometry = this.get('geometry');
      var lat = this.get('lat');
      var lon = this.get('lon');
      console.log('setLatLon', this);
      if( typeof geometry !== 'undefined'
          && geometry.coordinates
          && geometry.coordinates.length === 2 ) {
        this.set({
          lat: geometry.coordinates[1]
          , lon: geometry.coordinates[0]
        });
      } else if(lat && lon) {
        this.set('geometry', { type: 'Point', coordinates: [lon, lat] });
      }
    }
  });

  return Feature;
});
