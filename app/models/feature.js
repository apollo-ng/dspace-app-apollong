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
        lon: coords[0],
        accuracy: this.accuracy // FIXME: quite confusing for getLatLon
      };
    },
	/**
	 * Method: setLatLon
	 * 
	 * sets latitude and longitude
	 */
    setLatLon: function(lat, lon, accuracy) {
      var geometry = this.get('geometry') || {};
      this.accuracy = accuracy;
      geometry.coordinates = [lon, lat];
      this.set('geometry', geometry);
      setTimeout(function() {
        this.trigger('position-changed', this.getLatLon());
      }.bind(this), 0);
    },
    
    /**
     * Method: distanceTo
     * 
     * returns the distance in km to another <Feature>
     */
    distanceTo: function(feature) {
      var a = this.getLatLon();
      var b = feature.getLatLon();
      
      return this.calcDistance(a.lat, a.lon, b.lat, b.lon, "K");
    },

    formatDistance: function(distance) {
      return isNaN(distance[0]) ? '?' : distance.join('');
    },

    //Calculation from #50
    calcDistance: function (lat1, lon1, lat2, lon2, unit){
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
    },

    
    /**
     * Method: getSector
     * 
     * returns the QTH locator for a position
     * FIXME: this is not really the apropriate location for calculation
     * FIXME: maybe we need a 'coordinate' model? with access functions for various formats?
     */
    getSector: function(feature) {
        /**
       * Convert Decimal to Maidenhead (QTH) Locator
       * to have a human-readable and non-political "boundary"
       * sector/grid system for our world or any spherical habitat (planet)
       */
       
      var dd2maidenhead = function(lat, lon) {
        var sector, i, j, div, res, lp;
        var chr  = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        var num = "0123456789";
        var k = 0;
        var t = new Array(0,0,0);
        var n    = new Array(0,0,0,0,0,0,0);
        t[1]  = (lon + 180);
        t[2]  = (lat  +  90);

        for ( i = 1; i < 3; ++i ) {
          for ( j = 1; j < 4; ++j ) {
            if ( j != 3 ) {
              if ( i == 1 ) {
                if ( j == 1 ) div = 20;
                if ( j == 2 ) div = 2;
              }

              if ( i == 2 ) {
                if ( j == 1 ) div = 10;
                if ( j == 2 ) div = 1;
              }

              res = t[i] / div;
              t[i] = res;

              if ( t[i] > 0 ) {
                lp = Math.floor(res);
              } else {
                lp = Math.ceil(res);
              }

              t[i] = (t[i] - lp) * div;

            } else {

              if ( i == 1 ) {
                div = 12;
              } else {
                div = 24;
              }

              res = t[i] * div;
              t[i] = res;

              if ( t[i] > 0 ) {
                lp = Math.floor(res);
              } else {
                lp = Math.ceil(res);
              }
            }

            ++k;
            n[k] = lp;

          }
        }
        sector = chr.charAt(n[1]) + chr.charAt(n[4]) + num.charAt(n[2]);
        sector += num.charAt(n[5]) + chr.charAt(n[3])+ chr.charAt(n[6]);
        return (sector);
      };
      return dd2maidenhead(this.getLatLon().lat, this.getLatLon().lon);
    }
  }, {

    /**
     * Static method: fromGPXRoute
     *
     * Takes a GPX route XML source (either as a String or parsed XML) and returns
     * an Array of Feature objects representing the way points.
     */
    fromGPXRoute: function(gpxRoute) {
      if(typeof(gpxRoute) === 'string') {
        gpxRoute = (new DOMParser()).parseFromString(gpxRoute, 'application/xml');
      }
      console.log('parse route', gpxRoute);
      return Array.prototype.slice.call(gpxRoute.getElementsByTagName('rtept')).
        map(this._gpxRoutePointToFeature);
    },

    /**
     * Static method: fromGPXRoute
     *
     * Takes a GPX route XML source (either as a String or parsed XML) and returns
     * an Array of Feature objects representing the way points.
     */
    fromGPXTrack: function(gpxTrack) {
      if(typeof(gpxTrack) === 'string') {
        gpxTrack = (new DOMParser()).parseFromString(gpxTrack, 'application/xml');
      }
      console.log('parse track', gpxTrack);
      return Array.prototype.slice.call(gpxTrack.getElementsByTagName('trkpt')).
        map(this._gpxTrackPointToFeature);
    },

    _gpxRoutePointToFeature: function(routePoint) {
      return new Feature({
        geometry: {
          type: 'Point',
          coordinates: [
            parseFloat(routePoint.getAttribute('lon')),
            parseFloat(routePoint.getAttribute('lat'))          
          ]
        },
        properties: {
          type: 'route-point',
          name: routePoint.getElementsByTagName('name')[0].textContent,
          description: routePoint.getElementsByTagName('desc')[0].textContent
        }
      });
    },

    _gpxTrackPointToFeature: function(trackPoint) {
      return new Feature({
        geometry: {
          type: 'Point',
          coordinates: [
            parseFloat(trackPoint.getAttribute('lon')),
            parseFloat(trackPoint.getAttribute('lat'))          
          ]
        },
        properties: {
          type: 'track-point'
        }
      });
    }


  });

  return Feature;
});
