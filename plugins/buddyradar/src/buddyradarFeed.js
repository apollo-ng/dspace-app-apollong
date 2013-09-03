define([
  'geofeeds/base',
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
      this.onMessage = this.onMessage.bind(this);

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
      this.bayeux.addExtension({
        incoming: function(message, callback) {
          if(message.channel == '/meta/subscribe' && message.successful) {
            if(message.ext.initialState) {
              message.ext.initialState.forEach(function(status) {
                this.onMessage(status.data);
              }.bind(this));
            }
          }
          callback(message);
        }.bind(this),

        outgoing: function(message, callback) {
          if(message.channel == '/meta/subscribe') {
            if(! message.ext) {
              message.ext = {};
            }
            message.ext.token = dspace.world.user.get('buddyradarToken');
          }
          callback(message);
        }
      });
      this.bayeux.subscribe(this.chan, this.onMessage);
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
      var nickname = statusData.nickname;

      // ignore your own messages
      if(nickname === this.get('nickname')) return;

      // FIXME: extract into function
      var geoJSON = {
        id: statusData.uuid,
        geometry: {
          coordinates: [statusData.position.coords.longitude, statusData.position.coords.latitude]
        },
        properties: {
          type: "avatar",
          icon: statusData.icon,
          time: statusData.position.timestamp,
          accuracy: statusData.position.coords.accuracy,
          nickname: nickname,
          title: nickname
        },
      };

      var feature = this.featureIndex[nickname];
      if(!feature){
        var feature = new Feature(geoJSON);
        this.featureIndex[nickname] = feature;
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
