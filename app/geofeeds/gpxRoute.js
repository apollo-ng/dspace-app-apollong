define([
  'reqwest',
  'models/feature',
  'collections/feature',
  './base'
], function(Reqwest, Feature, FeatureCollection, Base) {

  "use strict";

  /**
   * Class: GeoFeeds.GPXRoute
   *
   */

  return Base.extend({

    type: 'GPXRoute',

    initFeed: function() {
      this.__defineGetter__('initUrl', function() {
        return this.url + 'router.cgi?' +
          'lat1=' + this.from.lat + ';' +
          'lon1=' + this.from.lon + ';' +
          'lat2=' + this.to.lat + ';' +
          'lon2=' + this.to.lon + ';' +
          'type=shortest'

      });
      this.__defineGetter__('routeUrl', function() {
        return this.url + 'results.cgi?' +
          'uuid=' + this.uuid + ';' +
          'format=gpx-route;' +
          'type=shortest'
      });
      this.__defineGetter__('trackUrl', function() {
        return this.url + 'results.cgi?' +
          'uuid=' + this.uuid + ';' +
          'format=gpx-track;' +
          'type=shortest'
      });

      // the primary collection stores route points.
      // this is a secondary collection to store track points, which are required to
      // render the exact route on the map, taking turns of roads etc into account.
      this.trackCollection = new FeatureCollection();
    },

    watch: function(options) {
      this.fetch();
    },

    fetch: function() {
      console.debug('start routing from', this.from, 'to', this.to);
      new Reqwest({
        url: this.initUrl,
        type: 'text',
        success: function(xhr) {
          var lines = xhr.responseText.split("\n");
          var uuid = lines[0], status = lines[1];
          if(status === 'OK') {
            this.uuid = uuid;
            this._fetchResults();
          } else {
            console.error("Failed to init routing request " + uuid + ": ", xhr);
          }
        }.bind(this)
      });
    },

    _fetchResults: function() {
      console.debug('fetch route & track points');
      new Reqwest({
        url: this.routeUrl,
        type: 'xml',
        success: this._receiveRoute.bind(this),
        failure: function(e) {
          console.error("Failed to fetch GPX route: ", e);
        }
      });

      new Reqwest({
        url: this.trackUrl,
        type: 'xml',
        success: this._receiveTrack.bind(this),
        failure: function(e) {
          console.error("Failed to fetch GPX track: ", e);
        }
      });
    },

    _receiveTrack: function(source) {
      console.debug('received track points');
      this.trackFeatures = Feature.fromGPXTrack(source)
      this._received();
    },

    _receiveRoute: function(source) {
      console.debug('received route points');
      this.routeFeatures = Feature.fromGPXRoute(source);
      this._received();
    },

    _received: function() {
      if(this.routeFeatures && this.trackFeatures) {
        console.debug('routing done.');
        this.trackCollection.reset(this.trackFeatures);
        this.updateCollection({ features: this.routeFeatures }, true);
        delete this.routeFeatures;
        delete this.trackFeatures;
      }
    }
    
  });

});
