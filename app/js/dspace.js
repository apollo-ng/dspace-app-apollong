define([
  'ender',
  'underscore',
  'backbone',
  'app/js/views/map/map',

  'reqwest',

], function( $, _, Backbone, Map, Reqwest ) {
console.log( Map );
/**
 * TODO document
 */

var DSpace = function(){


  /**
   * expects a config object
   * FIXME set defautls to override and don't crash if no options ;) -- default in User model ?
   */
  this.init = function ( ){

    var config = {
      geoFeeds: [
        { name: 'Hackerspaces Munich', url: '/test/hackerspaces-munich.json', type: 'CORS'},
        { name: 'OpenWiFi Munich', url: '/test/openwifi-munich.json', type: 'CORS'},
        { hub: 'open-reseource.org', type: 'DSNP'}
      ],
    
      map: {
        tileSet: {
            template: 'http://dspace.ruebezahl.cc:8888/v2/DSpace-tactical/{Z}/{X}/{Y}.png'
        },
        geolat:  48.115293,
        geolon:  11.60218,
        minZoom: 13,
        maxZoom: 17,
        defaultZoom: 12
      }
    };

    console.log("DSpace init");

    /**
     * single geographical featue of interest
     * with option to set from geoJSON feature object
     */
    var Feature = Backbone.Model.extend({

      initialize: function(){
        this.setLatLon();
      },

      /**
       * helper method for setting lat: lon: attributes from coordinates array
       */
      setLatLon: function(){
        var g = this.get('geometry');
        if( typeof g !== 'undefined' && 'coordinates' in g && g.coordinates.length == 2 ) {
          this.set({ lat: g.coordinates[1], lon: g.coordinates[0] }); //FIXME
        }
      }
    });
    var FeatureCollection = Backbone.Collection.extend({

      model: Feature,

      /**
       * override toJSON to adds a number to features's toJSON
       * so we can style markers with letters etc
       */
      toJSON: function( ) {
        var mappedJson = _(this.models).map( function(feature, index){
          feature.set( 'index', index );
          var featureJson = feature.toJSON();
          return featureJson;
        });
        return mappedJson;
      }

    });

    var FeatureCollectionCORS = FeatureCollection.extend({

      initialize: function( options ){
        if(options.url){
          this.url = options.url;
        }else{
          console.log('CORS with no url!');
        }
      },

      /**
       * requests the geojson
       * resets ifselft with the result
       * FIXME improve documentation
       */
      sync: function(){
        var self = this;
        var request = new Reqwest({
          url: this.url,
          type: 'json',
          success: function( response ) {
            self.reset( response.features );
          },
            failure: function( e ) {
              alert( '#FIXME' ); }
        });
      },
    });

    /**
     * Add basic user model
     */
    var User = Backbone.Model.extend({

        initialize: function() {

        this.world = this.get('world');

        /*
         * Start the geolocation
         * we bind user to update funtion to have it in callback as this
         * FIXME fallback when geolocations not allowed...
         */
        this.watch = navigator.geolocation.watchPosition (
          this._updateGeoLocation.bind(this), // FIXME: Why doesn't this work without underscores?
          this._reportGeoError.bind(this), {
            enableHighAccuracy : true
        });

        // Set a timeout in case the geolocation accuracy never meets the threshold.
        this.timeout = setTimeout(this._timeoutHandler.bind(this), 60000);

      },

      /*
       *  Update user's current geoLocation
       */
      _updateGeoLocation: function(geolocation) {
        this.set( 'geoLocation',  geolocation);
        if (geolocation.coords.accuracy < 50) {
          // FIXME: do something if this offset gets to crazy
        }
      },

      _reportGeoError: function(geolocation) {
          // FIXME: console.log(geolocation);
      },

      _timeoutHandler: function(geolocation) {
          // FIXME: console.log(geolocation);
      },

    });


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

        //@wip
        /**
         * create and render Map
         */
        this.map = new Map({model: this, config: this.get( 'map' )});
        this.map.render();
      },

      /**
       * just to notice existence of activeOverlays on a World
       */
      activeOverlays: function(){
          this.get('activeOverlays');
      }
    });

    /**
     * init() returns an instance of a World
     */
    return new World( config );

  };

  /**
   * returns itself
   */
  return this;

};

  return DSpace;

});
