define([
  'underscore',
  'backbone',
  'geofeeds/geoJson',
  'models/user',
  'views/map',
  'views/ui'
], function(_, Backbone, GeoJSONFeed, User, Map, UI) {

  /*
   * Class: World
   *
   * Holds main logic of managing *realm*
   *
   * (see world.png)
   */
  var World = Backbone.Model.extend({

    /**
     * Method: initialize
     *
     * - <createUser>
     * - <createFeeds> + sync them
     * - <createMap>
     * - creates <UI>
     * - <Map.render>
     * - <UI.render>
     *
     * Parameters:
     *   config - object with configurations
     *
     * (start code)
     * config: {
     *   geoFeeds: [],
     *   map: {},
     *   user: {}}
     * (end code)
     */
    initialize: function(  ){
      var self = this;
      this.config = this.get('config');

      this.user = this.createUser(this.config.user);
      // Property: geoFeeds
      //
      // @elf-pavlik: Document this.
      this.geoFeeds = this.createFeeds(this.config.geoFeeds);

      var aether = _.extend({ user: this.user }, Backbone.Events);

      /**
       * create and render Map & UI
       */
      this.map = this.createMap(this.config.map);
      this.ui = new UI({world: this, map: this.map, aether: aether});

      this.map.render();
      this.ui.render();


      this.user.on('change', function() {
        aether.trigger('user:change', this.user);
      }.bind(this));

      // fire initial change
      aether.trigger('user:change', this.user);

    },

    /**
     * Method: createUser
     * creates a <User> passing it *<World>* and *config.user*
     * (start code)
     * config: {
     *   user: {
     *     prefCoordSys: 'GPS'}}
     * (end code)
     */
    createUser: function(config){
      var user = User.default();
      user.setDefaults(config);
      return user;
    },

    /**
     * Method: createFeeds
     * creates <FeatureCollection>s from array in *config.geoFeeds*
     *
     * *currently sync right away*
     *
     * (start code)
     * config: {
     *   geoFeeds: [
     *     { name: 'OpenWiFi Munich', url: '/test/openwifi-munich.json', type: 'CORS'},
     *     { name: 'Hackerspaces Munich', url: '/test/hackerspaces-munich.json', type: 'CORS'},
     *     { hub: 'open-reseource.org', type: 'DSNP'}]}
     * (end code)
     */
    createFeeds: function( feedConfigs ){
      var feeds = [];
      feedConfigs.forEach(function(feed) {
        feed = this.createFeed(feed);
        if(feed) {
          feeds.push(feed);
          feed.watch();
        }
      }.bind(this));
      return feeds;
    },

    createFeed: function(feed) {
      switch(feed.type){
      case 'CORS':
        return new GeoJSONFeed(feed);
        break;
      default:
        console.log('tried creating ' + feed.type + ' collections')
        break;
      };
    },

    /**
     * Method: createMap
     * creates a <Map> passing it *<World>* and *config.map*
     * (start code)
     * config: {
     *   map: {
     *     tileSet: {
     *       template: 'http://dspace.ruebezahl.cc:8888/v2/DSpace-Tactical-LQ/{Z}/{X}/{Y}.png'},
     *     geolat:  48.115293,
     *     geolon:  11.60218,
     *     minZoom: 13,
     *     maxZoom: 17,
     *     miniMapZoom: 11,
     *     defaultZoom: 12
     *   }}
     * (end code)
     */
    createMap: function(config){
      return new Map({world: this, config: config});
    }
  });

  return World;
});
