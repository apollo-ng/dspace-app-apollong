define([
  './base'
], function(BaseFeed) {

  /**
   * Class: GeoFeeds.Search
   *
   * Represents a search and it's results.
   */
  return BaseFeed.extend({

    type: 'Search',

    /**
     * Property: query
     * An expression of what you are looking for.
     */
    query: '',

    /**
     * Method: initialize
     * Extends <BaseFeed.initialize>. Calls <fetch>.
     */
    initialize: function() {
      BaseFeed.prototype.initialize.apply(this, arguments);

      // Property: visible
      // enabled by default
      this.set('visible', true);

      this.fetch();
    },

    makeTitle: function() {
      return 'Search: ' + this.query;
    },

    /**
     * Method: fetch
     * Fetches results from <nominatim at http://nominatim.openstreetmap.org/>.
     *
     * See http://wiki.openstreetmap.org/wiki/Nominatim for reference.
     */
    fetch: function() {
      var xhr = new XMLHttpRequest();
      var url = 'http://nominatim.openstreetmap.org/search/' + encodeURIComponent(this.query) + '?format=json&polygon_geojson=1';
      if(this.extent) {
        url += '&viewbox=' + this.extent.west + ',' + this.extent.north + ',' + this.extent.east + ',' + this.extent.south + '&bounded=0';
      }
      // FIXME: add current bounding-box via 'viewbox' parameter to improve results.
      xhr.open('GET', url, true);
      xhr.addEventListener('load', function() {
        var results = JSON.parse(xhr.responseText);
        results.forEach(function(result) {
          var feature = this.nominatimToFeature(result);
          if(feature) {
            this.collection.add(feature);
          }
        }.bind(this));
      }.bind(this));
      xhr.send();
    },

    /**
     * Method: nominatimToFeature
     * Converts a JSON object as returned by nominatim into a geoJSON Feature.
     */
    nominatimToFeature: function(object) {
      console.log('geojson', object.geojson);
      if(object.geojson.type !== 'Point') {
        // FIXME: ugly hack to exclude search results that have non-point references
        //        (such as a Polygon). Instead displaying non-point data should be
        //        implemented.
        return;
      }
      var displayName = object.display_name;
      // usually the first part is the only thing of interest
      var md = displayName.match(/^([^,]+),(.+)$/);
      var title = md[1];
      var description = md[2];
      // sometimes the first part is the house number.
      if(/^\d/.test(title)) {
        md = description.match(/^([^,]+),(.+)$/);
        title = md[1] + ', ' + title;
        description = md[2];
      }
      return {
        type: 'Feature',
        geometry: object.geojson,
        properties: {
          title: title,
          description: description
        }
      }
    }

  });

});