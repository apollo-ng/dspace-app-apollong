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

      // this.user.watchPosition();

      // Property: geoFeeds
      //
      // @elf-pavlik: Document this.
      this.geoFeeds = this.createFeeds(this.config.geoFeeds);

      this.aether = _.extend({ user: this.user }, Backbone.Events);


      this.user.on('change', function() {
        this.aether.trigger('user:change', this.user);
      }.bind(this));

      // fire initial change
      this.aether.trigger('user:change', this.user);

      /**
       * this serves features to the userlayer
       * userlayer view listens on change:geometry and 
       * updates the position of the user on the map
       */
    //   var avatar = new Feature({
    //     id: 'avatar',
	  // type: 'Point',
    //       geometry: {
    //         coordinates: { }},
    //       properties: {
    //         type: 'avatar',
    //         title: 'aloha o/' } });
    //   this.userFeed = new GeoJSONFeed( );
    //   this.userFeed.collection = new FeatureCollection([avatar])

  //     this.user.on( 'change:geoLocation', function( e ){
	// var location = e.get( 'geoLocation' ) 
	//       //avatar.set({ geometry: { coordinates: [location.coords.longitude, location.coords.latitude] }});
  //     });
  //     this.user.updatePosition( );

      // FIXME: make this more efficient!
      this.featureIndex = {};

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

          feed.collection.on('change', function(feature) {
            this.featureIndex[feature.get('uuid')] = feature;
          }.bind(this));

          feed.set('visible', true);
        }
      }.bind(this));
      return feeds;
    },

    getCurrentFeature: function() {
      var uuid = this.get('currentFeatureId');
      if(uuid) {
        return this.featureIndex[uuid];
      }
    },

    createFeed: function(feed) {
      switch(feed.type){
      case 'CORS':
        return new GeoJSONFeed(feed);
        break;
      case 'remoteStorage':
        if(this.user.get('remoteStorage')) {
          return new RemoteStorageFeed(feed);
        }
        break;
      default:
        console.log('tried creating ' + feed.type + ' collections')
        break;
      };
    }

  });

  return World;
});
