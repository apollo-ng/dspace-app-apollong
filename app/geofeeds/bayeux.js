define([
  './base',
  'models/feature'
], function(BaseFeed, Feature) {

  /**
   * Class: BayeuxFeed
   *
   * implemented using Faye - http://faye.jcoglan.com/
   *
   * Receives:
   *
   *   url - address of the server
   *   channel - channel to subscribe
   *   userId - uuid of avatar from <DeviceFeed>
   *
   */
  return BaseFeed.extend({

    watch: function(){
      /**
       * Property: featureIndex
       *
       * keeps index of <Feature>s by uuid
       *
       * FIXME move this logic to <FeatureCollection> get/set by UUID
       */
      this.featureIndex = {};

      var url = this.get('url');
      this.chan = '/'+ this.get('chan');
      this.userId = this.get('userId');

      var faye = window.Faye; //FIXME require !!!
      this.bayeux = new faye.Client(url);
      this.bayeux.subscribe(this.chan, this.onMessage.bind(this));
    },

    /**
     * Method: onMessage
     *
     * create a new or update existing feature based on uuid
     *
     * Receives:
     *
     * statusData - <User.getStatusData>
     */
    onMessage: function(statusData){
      var uuid = statusData.uuid;

      // ignore your own messages
      if(uuid === this.userId) return;

      // FIXME: extract into function
      var geoJSON = {
        id: uuid,
        geometry: {
          coordinates: [statusData.lon, statusData.lat]
        },
        properties: {
          type: "avatar",
          time: statusData.timestamp,
          accuracy: statusData.accuracy
        },
      };
      if(statusData.speed) geoJSON.properties.speed = statusData.speed;

      var feature = this.featureIndex[uuid];
      if(!feature){
        var feature = new Feature(geoJSON);
        this.featureIndex[uuid] = feature;
        this.collection.add(feature);
        this.collection.trigger('feed'); //FIXME hack to avoid phantom first feature
      } else {
        var oldJSON = feature.toJSON();
        // don't update if same coordinates and accuracy
        if(!(oldJSON.geometry.coordinates === geoJSON.geometry.coordinates
          && oldJSON.properties.accuracy === geoJSON.properties.accuracy)){
          feature.set(geoJSON);
          this.collection.trigger('feed');
        }
      }
    },

    /**
     * Method: publish
     *
     * publishes feature to channel
     *
     * Receives:
     *
     * statusData - <User.getStatusData>
     */
    publish: function(statusData){
      this.bayeux.publish(this.chan, statusData);
    }
  });
});
