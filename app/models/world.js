define([
  'underscore',
  'backbone',
  'collections/cors',
  'models/user',
  'views/map',
  'views/ui'
], function(_, Backbone, FeatureCollectionCORS, User, Map, UI) {

  /*
   * Class: World
   *
   * Holds main logic of managing
   *
   * * FeatureCollections
   * * Map
   * * User
   */
  var World = Backbone.Model.extend({

    /**
     * Method: initialize
     * Genesis ;)
     *
     * Parameters:
     *   config - object with configurations
     *
     * (start code)
     * config: {
     *   geoFeeds: [
     *     { name: 'OpenWiFi Munich', url: '/test/openwifi-munich.json', type: 'CORS'},
     *     { name: 'Hackerspaces Munich', url: '/test/hackerspaces-munich.json', type: 'CORS'},
     *     { hub: 'open-reseource.org', type: 'DSNP'}],
     *   map: {
     *     tileSet: {
     *       template: 'http://dspace.ruebezahl.cc:8888/v2/DSpace-Tactical-LQ/{Z}/{X}/{Y}.png'},
     *     geolat:  48.115293,
     *     geolon:  11.60218,
     *     minZoom: 13,
     *     maxZoom: 17,
     *     miniMapZoom: 11,
     *     defaultZoom: 12
     *   },
     *   user: {
     *     prefCoordSys: 'GPS'}}}
     * (end code)
     */
    initialize: function(  ){
      var self = this;
      this.config = this.get('config');
      this.geoFeeds = this.config.geoFeeds;

      /**
       * create User
       */
      this.user = new User({world: this, config: this.config.user});

      /**
       * create FeatureCollections
       */
      this.featureCollections = [];
      for(var i = 0; i < this.geoFeeds.length; i++){
        var feed = this.geoFeeds[i];
        switch(feed.type){
        case 'CORS':
          var featureCollection = new FeatureCollectionCORS(feed);
          //for now sync it right away!
          featureCollection.sync()

          this.featureCollections.push(featureCollection);
          break;
        default:
          console.log('tried creating ' + feed.type + ' collections')
          break;
        };
      };

      /**
       * create and render Map & UI
       */
      this.map = new Map({world: this, config: this.config.map});
      this.ui = new UI({world: this, map: this.map});

      this.map.render();
      this.ui.render();

    }
  });

  return World;
});
