define([
  'backbone',
  'collections/cors',
  'models/user',
  'views/map',
  'views/ui'
], function(Backbone, FeatureCollectionCORS, User, Map, UI) {

  var World = Backbone.Model.extend({

    /**
     * Genesis ;)
     */
    initialize: function(  ){
      var self = this;
      this.geoFeeds = this.attributes.geoFeeds;

      /**
       * create User
       */
      this.user = new User({world: this});

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
      this.map = new Map({world: this, config: this.get( 'map' )});
      this.ui = new UI({world: this, map: this.map});

      this.map.render();
      this.ui.render();

    }
  });

  return World;
});