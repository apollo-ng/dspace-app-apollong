define([
  'underscore',
  'backbone',
  'geofeeds/geoJson',
  'geofeeds/spaceApi',
  'geofeeds/bayeux',
  'collections/feature',
  'models/feature',
  'geofeeds/device',
  'models/user'
], function(_, Backbone, GeoJSONFeed, SpaceApiFeed, BayeuxFeed, FeatureCollection,
            Feature, DeviceFeed, User ) {

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

      setTimeout(function() {

        var feedList = this.config.geoFeeds;
        var feedsByName = feedList.reduce(function(byName, feed) {
          byName[feed.name] = feed;
          return byName;
        }, {});

        // load geoFeeds config option as section for overlay manager
        dspace.ui.overlayManager.registerType({
          name: "Hardcoded",
          category: 'public',
          writable: false,
          listCollections: function(callback) {
            callback(feedList);
          },
          getCollection: function(name, callback) {
            callback(feedsByName[name]);
          }
        });
      }.bind(this), 0);

      // #FIXME
      this.buddyFeed = new BayeuxFeed({
        url:'http://194.150.168.83:5000/dspace',
        chan: 'dspace',
        userId: this.user.feed.avatar.id,
        visible: true});
      this.buddyFeed.watch();
      this.user.on('location-changed', function(latLon) {
        this.buddyFeed.publish(this.user.feed.avatar.toJSON());
      }.bind(this));

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
     *     { name: 'OpenWiFi Munich', url: '/test/openwifi-munich.json', type: 'GeoJSON'},
     *     { name: 'Hackerspaces Munich', url: '/test/hackerspaces-munich.json', type: 'GeoJSON'},
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

    /**
     * Method getFeature
     *
     * returns <Feature> with given uuid
     */
    getFeature: function(uuid) {
      return this.featureIndex[uuid];
    },

    /**
     * Method newFeature
     *
     * returns new feature with location set from parameter
     *
     * Receives
     *
     *  location - an instance of MM.Location
     */
    newFeature: function(location){
      var feature = new Feature();
      var properties = {type: "", title: "", description: ""};
      feature.set('properties', properties);
      feature.setLatLon(location.lat, location.lon);
      return feature;
    },

    addFeedType: function(type, constructor) {
      if(this.feedConstructors[type]) {
        console.log("WARNING: adding already declared feed type " + type);
      }
      this.feedConstructors[type] = constructor;
    },

    feedConstructors: {
      GeoJson: GeoJSONFeed,
      SpaceAPI: SpaceApiFeed
    },

    /**
     * Method: createFeed
     *
     * creates <GeoFeed> instances based on type from feed definition
     */
    createFeed: function(feed) {
      var constructor = this.feedConstructors[feed.type];
      if(constructor) {
        return new constructor(feed);
      } else {
        console.log('WARNING: Feed type not implemented: ' + feed.type);
      }
    },

    // Stop the Geolocation watcher (device.js: unwatch)
    setStaticUserLocation: function(location) {
      this.user.feed.avatar.setLatLon(location.lat, location.lon);
      this.user.feed.unwatch();
    }

  });

  return World;
});
