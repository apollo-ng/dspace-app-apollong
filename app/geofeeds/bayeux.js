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
   *
   */
  return BaseFeed.extend({

    watch: function(){
      /**
       * Property: featureIndex
       *
       * keeps index of <Feature>s by uuid
       *
       * FIXME move this logic to <FeatureCollection>
       */
      this.featureIndex = {};

      var url = this.get('url');
      this.chan = '/'+ this.get('chan');
      this.userId = this.get('userId');
      var faye = window.Faye; //FIXME require !!!
      var bayeux = new faye.Client(url);
      bayeux.subscribe(this.chan, this.onMessage.bind(this));
      this.bayeux = bayeux;
    },

    /**
     * Method: onMessage
     *
     * create a new or update existing feature based on uuid
     */
    onMessage: function(featureJson){
      var id = featureJson.id;
      if(id === this.userId){return};
      if(!this.featureIndex[id]){
        var feature = new Feature(featureJson);
        this.featureIndex[id] = feature;
        this.collection.add(feature);
        this.collection.trigger('feed'); //FIXME hack to avoid phantom first feature
      } else {
        if(JSON.stringify(featureJson) != JSON.stringify(this.featureIndex[id].toJSON())){
          this.featureIndex[id].set(featureJson);
          this.collection.trigger('feed');
        }
      }
      console.log(this.featureIndex[id]);
    },

    /**
     * Method: publish
     *
     * publishes feature to channel
     *
     * Receives:
     *
     *  featureJson - <Feature.toJSON>
     */
    publish: function(featureJson){
      this.bayeux.publish(this.chan, featureJson);
    }
  });
});
