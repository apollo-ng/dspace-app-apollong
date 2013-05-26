define([
  'underscore',
  '../lib/remotestorage',
  '../lib/remotestorage-locations',
  'models/feature',
  'geofeeds/base'
], function(_, remoteStorage, locations, Feature, Base) {

  
  /**
   * Class: GeoFeeds.RemoteStorage
   */
  return Base.extend({

    type: 'RemoteStorage',

    initFeed: function() {
      remoteStorage.on('disconnect', function() {
        this.collection.reset();
      }.bind(this));
    },

    watch: function() {
      var watchCollection = function(collection) {
        collection.watch(function(action, feature) {
          switch(action) {
          case 'add':
            this.collection.add(feature);
            break;
          case 'update':
            this.collection.update([feature])
            break;
          case 'remove':
            this.collection.remove(feature);
            break;
          }
        }.bind(this));
        
        var initialUpdate = function() {
          collection.getFeatures().then(function(features) {
            this.updateCollection({ features: features }, true);
          }.bind(this));
        }.bind(this);
        remoteStorage.on('ready', initialUpdate);
        initialUpdate();

      }.bind(this);

      if(this.user) {
        // FIXME: implement getForeignCollection
        locations.getForeignCollection(this.user, this.name).
          then(watchCollection);
      } else {
        locations.getCollection(this.name).then(function(collection) {
          this.collection.on('add', function(feature) {
            collection.addFeature(feature.toJSON());
          });

          watchCollection(collection);
        }.bind(this));
      }
    },

    makeTitle: function() {
      return 'remoteStorage: ' + this.name;
    }

  });

});
