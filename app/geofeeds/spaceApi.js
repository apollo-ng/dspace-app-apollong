define([
  'underscore',
  'reqwest',
  './base',
], function(_, Reqwest, Base) {

  "use strict";

  /**
   * Class: GeoFeeds.SpaceAPI
   *
   * initialized with
   * { name: 'Hackerspaces', url: '/examples/spaceapi/hackerspaces.json', type: 'SpaceAPI'}
   *
   */

  return Base.extend({

    type: 'SpaceAPI',

    watch: function(){
      this.fetch();
    },

    fetch: function() {
      var request = new Reqwest({
        url: this.url,
        type: 'json',
        crossOrigin: true,
        success: this.fetchSpaces.bind(this),
        failure: function( e ) {
          alert( '#FIXME' ); }
      });
    },

    /**
     * Method: fetchSpaces
     *
     * fetches spaces from directory of SpaceAPI endpoints
     * ex: http://openspace.slopjong.de/directory.json
     *
     * Receives:
     *
     *   directory - object with keys (hackerspace names) and values (api endpoints)
     */
    fetchSpaces: function(directory){
      for (var name in directory) {
        var url = directory[name];
        var request = new Reqwest({
          url: url,
          type: 'json',
          crossOrigin: true,
          success: function(space){
            if(space.lat && space.lon){
              this.addSpace(space)
            }
          }.bind(this),
          failure: function( e ) {
            alert( '#FIXME' ); }
        });
      }
    },

    /**
     * Method: addSpace
     *
     * adds space to <FeatureCollection>
     *
     * FIXME: add more data from response
     */
    addSpace: function(space){
      var featureJson = {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [space.lon, space.lat]
        },
        properties: {
          title: space.space,
        }
      }
      this.collection.add(featureJson);
    }
  });
});
