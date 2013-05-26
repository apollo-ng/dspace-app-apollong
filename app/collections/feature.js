define(['backbone', 'models/feature'], function(Backbone, Feature) {

  /**
   * Class: FeatureCollection
   *
   * Base class for extending
   */
  var FeatureCollection = Backbone.Collection.extend({

    model: Feature,

    /**
     * Method: distanceComparator
     *
     * Compare function used to sort by current location.
     * Assigned to the `comparator' property once current location is set through
     * `sortByDistanceTo', so sorting only happens when the it is requested by the
     * view. The actual sorting is done by backbone.
     */
    distanceComparator: function(_a, _b) {
      var a = _a.distanceTo(this.currentLocation);
      var b = _b.distanceTo(this.currentLocation);
      if(isNaN(a[0]) || isNaN(b[0])) {
        // fallback to sort by name, if one of the features doesn't have a valid
        // distance to our current location for some reason.
        a = _a.name, b = _b.name;
      } else {
        // convert to meters.
        a = a[0] * (a[1] == 'km' ? 1000 : 1);
        b = b[0] * (b[1] == 'km' ? 1000 : 1);
      }
      return a > b ? 1 : a < b ? -1 : 0;
    },

    /**
     * Method: sortByDistanceTo
     *
     * Sorts this collection by distance to the given feature's location. If the
     * given feature triggers a `position-changed' event, the collection will be
     * re-sorted whenever that happens.
     */
    sortByDistanceTo: function(feature) {
      this.currentLocation = feature;
      this.comparator = this.distanceComparator;
      this.currentLocation.on('position-changed', function() {
        this.sort();
      }.bind(this));
    },

    /**
     * Method: toJSON
     *
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
