define([
  './base',
  'models/feature',
  'faye-client'
], function(BaseFeed, Feature, Faye) {

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

      this.bayeux = new Faye.Client(url);
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
          coordinates: [statusData.position.coords.longitude, statusData.position.coords.latitude]
        },
        properties: {
          type: "avatar",
          icon: statusData.icon,
          time: statusData.position.timestamp,
          accuracy: statusData.position.coords.accuracy
        },
      };
      // FIXME: extract into method since duplicated in <User>
      var optional = ["altitude", "altitudeAccuracy", "heading", "speed"]
      for(var i=0;i<optional.length;i++){
        var key = optional[i];
        if(statusData.position.coords[key]) geoJSON.properties[key] = statusData.position.coords[key]
      };

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
