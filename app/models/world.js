define([
  'underscore',
  'backbone',
  'geofeeds/geoJson',
  'collections/feature',
  'models/feature',
  'geofeeds/remoteStorage',
  'geofeeds/device',
  'models/user'
], function(_, Backbone, GeoJSONFeed, FeatureCollection, Feature,
            RemoteStorageFeed, DeviceFeed, User ) {

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
     * - <setupUser>
     * - <createFeeds> + sync them
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

      this.user = this.setupUser(this.config.user);

      // FIXME: make this more efficient!
      this.featureIndex = {};

      // Property: geoFeeds
      //
      // @elf-pavlik: Document this.
      this.geoFeeds = [];
      this.createFeeds(this.config.geoFeeds);

      this.aether = _.extend({ user: this.user }, Backbone.Events);


      this.user.on('change', function() {
        this.aether.trigger('user:change', this.user);
      }.bind(this));

      // fire initial change
      this.aether.trigger('user:change', this.user);

    },

    /**
     * Method: setupUser
     *
     * Loads the first (and only) <User> or creates a new one.
     *
     */
    setupUser: function(config){
      return User.first() || new User({ config: config });
    },

    addFeed: function(feed, setCurrent) {
      feed.index = this.geoFeeds.length;
      this.geoFeeds.push(feed);
      feed.watch();
      this.trigger('add-feed', feed);
      if(setCurrent) {
        this.setCurrentFeed(feed.index);
      }

      feed.collection.on('add', function(feature) {
        this.featureIndex[feature.get('id')] = feature;
      }.bind(this));

      feed.set('visible', true);
      return feed.index;
    },

    setCurrentFeed: function(index) {
      this.set('currentFeed', index);
      setTimeout(function() {
        this.trigger('select-feed', index);
      }.bind(this), 0);
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
      feedConfigs.forEach(function(feed) {
        feed = this.createFeed(feed);
        if(feed) {
          this.addFeed(feed);
        }
      }.bind(this));
    },

    getCurrentFeature: function() {
      var id = this.get('currentFeatureId');
      if(id) {
        return this.featureIndex[id];
      }
    },

    createFeed: function(feed) {
      switch(feed.type){
      case 'CORS':
        return new GeoJSONFeed(feed);
        break;
      case 'remoteStorage':
        return new RemoteStorageFeed(feed);
        break;
      default:
        console.log('WARNING: Feed type not implemented: ' + feed.type);
        break;
      };
    }

  });

  return World;
});
