define([
  'underscore',
  'remoteStorage',
  'remoteStorage-locations',
  'models/feature',
  './base'
], function(_, remoteStorage, locations, Feature, Base) {

  
  /**
   * Class: GeoFeeds.RemoteStorage
   */
  return Base.extend({

    type: 'RemoteStorage',

    watch: function() {
      // FIXME: move to setup!!
      remoteStorage.onWidget('disconnect', function() {
        this.collection.reset();
      }.bind(this));

      var watchCollection = function(collection) {
        collection.watch(function(action, feature) {
          switch(action) {
          case 'add':
            console.log('add feature', feature);
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
        remoteStorage.onWidget('ready', initialUpdate);
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