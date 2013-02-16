define([
  'underscore',
  'backbone',
  'Math.uuid'
], function(_, Backbone, MathUUID) {
  /**
   * Class: Feature
   *
   * single geographical featue of interest
   * with option to set from geoJSON feature object
   *
   * (see feature.png)
   */
  var Feature = Backbone.Model.extend({
	/**
	 * Method: initialize
	 * 
	 * initializes a <Feature> from a <location>
	 */
    initialize: function(location){
      if(location) {
        this.set(location);
      }

      if(! this.get('properties')) {
        this.set('properties', {});
      }

      if(! this.get('geometry')) {
        this.set('geometry', {});
      }

      if(! this.get('id')) {
        this.set('id', MathUUID.uuid());
      }

    },
	/**
	 * Method: getLatLon
	 * 
	 * retrives latitude and longitude
	 */
    getLatLon: function() {
      var coords = this.get('geometry').coordinates || [];
      return {
        lat: coords[1],
        lon: coords[0]
      };
    },
	/**
	 * Method: setLatLon
	 * 
	 * sets latitude and longitude
	 */
    setLatLon: function(lat, lon) {
      var geometry = this.get('geometry') || {};
      geometry.coordinates = [lon, lat];
      this.set('geometry', geometry);
      this.trigger('position-changed', this.getLatLon());
    },
    
    /**
     * Method: distanceTo
     * 
     * returns the distance in km to another <Feature>
     */
    distanceTo: function(feature) {
      
      //Calculation from #50
      var distance = function (lat1, lon1, lat2, lon2, unit){
        var radlat1 = Math.PI * lat1/180
        var radlat2 = Math.PI * lat2/180
        var radlon1 = Math.PI * lon1/180
        var radlon2 = Math.PI * lon2/180
        var theta = lon1-lon2
        var radtheta = Math.PI * theta/180
        var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
        dist = Math.acos(dist)
        dist = dist * 180/Math.PI
        dist = dist * 60 * 1.1515
        if (unit=="K") { dist = dist * 1.609344 }
        if (unit=="N") { dist = dist * 0.8684 }
        var result = [];
      
        if (dist < 1 && unit == 'K') {
          result[0]=Math.round(dist * 1000);
          result[1]="m";
        } else {
          result[0]=Math.round(dist);
          result[1]="km";
        }
        return result;
      }
      var d = distance(this.getLatLon().lat,this.getLatLon().lon, feature.getLatLon().lat, feature.getLatLon().lon, "K");
      if (isNaN(d[0])) {
        return "?"
      } else {
      return d[0]+d[1];
      }
    }
  });

  return Feature;
});
