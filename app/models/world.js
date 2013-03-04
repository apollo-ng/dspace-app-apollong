define([
  'underscore',
  'backbone',
  'geofeeds/geoJson',
  'geofeeds/spaceApi',
  'collections/feature',
  'models/feature',
  'geofeeds/remoteStorage',
  'geofeeds/device',
  'models/user'
], function(_, Backbone, GeoJSONFeed, SpaceApiFeed, FeatureCollection, Feature,
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

      this.aether.on('remove-feed', this.removeFeed.bind(this));

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

      this.listenTo(feed.collection, 'add', function(feature) {
        this.featureIndex[feature.get('id')] = feature;
      }.bind(this));

      this.listenTo(feed, 'change:only', function() {
        if(feed.get('only')) {
          var currentOnly = this.get('currentOnly');
          if(currentOnly) {
            currentOnly.set('only', false);
          }
          this.set('currentOnly', feed);
        }
      }.bind(this));

      feed.set('visible', true);
      return feed.index;
    },

    removeFeed: function(index) {
      var feed = this.geoFeeds[index];
      // clean up event handler
      this.stopListening(feed);
      this.stopListening(feed.collection);
      // remove feed
      this.geoFeeds.splice(index, 1);
      // adjust index for remaining feeds
      var fl = this.geoFeeds.length;
      for(var i=index;i<fl;i++) {
        this.geoFeeds[i].index = i;
      }
      // set new current feed, if feed was currently selected
      if(this.get('currentFeed') === index) {
        this.setCurrentFeed(Math.max(index - 1, 0));
      }
      this.trigger('remove-feed', index);
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

    getFeature: function(uuid) {
      return this.featureIndex[uuid];
    },

    createFeed: function(feed) {
      switch(feed.type){
      case 'CORS':
        return new GeoJSONFeed(feed);
        break;
      case 'remoteStorage':
        return new RemoteStorageFeed(feed);
        break;
      case 'SpaceAPI':
        return new SpaceApiFeed(feed);
        break;
      default:
        console.log('WARNING: Feed type not implemented: ' + feed.type);
        break;
      };
    }

  });

  return World;
});
