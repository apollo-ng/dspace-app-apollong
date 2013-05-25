define(['backbone', 'models/feature'], function(Backbone, Feature) {

  /**
   * Class: FeatureCollection
   *
   * Base class for extending
   */
  var FeatureCollection = Backbone.Collection.extend({

    model: Feature,

    comparator: function(_a, _b) {
      var a, b;
      if(this.currentLocation) {
        a = _a.distanceTo(this.currentLocation);
        b = _b.distanceTo(this.currentLocation);
        if(isNaN(a[0]) || isNaN(b[0])) {
          // fallback to sort by name, if one of the features doesn't have a valid
          // distance to our current location for some reason.
          a = _a.name, b = _b.name;
        } else {
          // convert to meters.
          a = a[0] * (a[1] == 'km' ? 1000 : 1);
          b = b[0] * (b[1] == 'km' ? 1000 : 1);
        }
      } else {
        a = _a.name, b = _b.name;
      }
      return a > b ? 1 : a < b ? -1 : 0;
    },

    sortByDistanceTo: function(feature) {
      this.currentLocation = feature;
      this.currentLocation.on('position-changed', function() {
        this.sort();
      }.bind(this));
    },

    /**
     * override toJSON to adds a number to features's toJSON
     * so we can style markers with letters etc
     */
    toJSON: function( ) {
      var mappedJson = _(this.models).map( function(feature, index){
        feature.set( 'index', index );
        var featureJson = feature.toJSON();
        return featureJson;
      });
      return mappedJson;
    }

  });

  return FeatureCollection;

});
