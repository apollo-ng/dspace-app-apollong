
define([], function() {

  /**
   * Class: RouteLayer
   *
   * A modestmaps layer to display a route.
   */

  var RouteLayer = function(feed) {
    this.feed = feed;

    this.__defineGetter__('features', function() {
      return this.feed.collection.models;
    });
    this.__defineGetter__('tracks', function() {
      return this.feed.trackCollection.models;
    });

    this.canvas = document.createElement('canvas');

    // modestmaps expect layers to have a 'parent' element.
    this.parent = this.canvas;
    
  };

  RouteLayer.prototype = {

    /**
     * Property: map
     *
     * A MM.Map object. Set by MM.Map#addLayer automatically.
     */
    map: undefined,

    /**
     * Property: color
     *
     * Color for rendering this route.
     */
    color: 'blue',

    /**
     * Method: draw
     *
     * Draw the current route and add it to the DOM.
     */
    draw: function() {

      // if map isn't set, we can't render yet.
      // shouldn't happen normally, but allows draw() to be called while the layer
      // hasn't been added to the map yet, without causing an error.
      // Once the layer is added to the map, the map will call this method again.
      if(! this.map) { return; }

      // set size of canvas to be equal to the map
      var mapRect = this.map.parent.getClientRects()[0];
      this.canvas.width = mapRect.width;
      this.canvas.height = mapRect.height;
      this.canvas.style.position = 'absolute';
      this.canvas.style.left = mapRect.left + 'px';
      this.canvas.style.top = mapRect.top + 'px';

      var context = this.canvas.getContext('2d');

      context.strokeStyle = this.color;
      context.lineWidth = 2;

      context.beginPath();
      this.tracks.forEach(function(trackPoint, i) {
        // convert location to screen coordinates
        var point = this.map.locationPoint(trackPoint.getLatLon());
        // make coordinates relative to the canvas
        point.x -= mapRect.left;
        point.y -= mapRect.top;
        if(i === 0) {
          context.moveTo(point.x, point.y);
        } else {
          context.lineTo(point.x, point.y);
        }
      }.bind(this));
      context.stroke();

      context.strokeStyle = 'black';
      context.fillStyle = this.color;

      var lastIndex = this.features.length - 1;
      this.features.forEach(function(feature, i) {
        var point = this.map.locationPoint(feature.getLatLon());
        context.beginPath();
        if(i == 0 || i === lastIndex) {
          context.arc(point.x, point.y, 5, 5, -Math.PI, Math.PI);
        } else {
          context.arc(point.x, point.y, 3, 3, -Math.PI, Math.PI);
        }
        context.fill();
      }.bind(this));
    },

    /**
     * Method: destroy
     *
     * Destroy the DOM representation of this layer.
     *
     */
    destroy: function() {
      if(this.canvas.parentElement) {
        this.canvas.parentElement.removeChild(this.canvas);
      }
      this.map.removeLayer(this);
      this.canvas = this.parent = document.createElement('canvas');
   },

    /**
     * Method: extent
     *
     * Returns an Array of two points (i.e. objects with 'lat' and 'lon' attributes),
     * representing the bottom-right and top-left points of a rectangle that contains
     * all points in this route.
     *
     */
    extent: function() {
      return this.features.reduce(function(ext, feature) {
        var c = feature.get('geometry').coordinates;
        if (c[0] < ext[0].lon) ext[0].lon = c[0];
        if (c[1] < ext[0].lat) ext[0].lat = c[1];
        if (c[0] > ext[1].lon) ext[1].lon = c[0];
        if (c[1] > ext[1].lat) ext[1].lat = c[1];
        return ext;
      }, [{
        lat: Infinity,
        lon: Infinity
      }, {
        lat: -Infinity,
        lon: -Infinity
      }]);
    }

  };

  return RouteLayer;

});