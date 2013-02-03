define([], function() {

  /**
   * Constant: config
   *
   * config for initializing DSpace Wrorld
   */
  return {

    /**
     * Property: geoFeeds
     *
     * initial set for populating <FeatureCollection>s
     */
    geoFeeds: [
      { name: 'OpenWiFi Munich', url: '/test/openwifi-munich.json', type: 'CORS'},
      { name: 'Hackerspaces Munich', url: '/test/hackerspaces-munich.json', type: 'CORS'},

      { name: 'Pools', url: '/test/pools-munich.json', type: 'CORS'},

      // { hub: 'open-reseource.org', type: 'DSNP'},

      { name: 'test', type: 'remoteStorage' },
      //{ name: 'test', user: 'nil@heahdk.net', type: 'remoteStorage' }

    ],

    /**
     * Property: map
     *
     * map defaults
     */
    map: {
      
      tileSets: {
         dspace: 'http://dspace.ruebezahl.cc:8888/v2/DSpace-Tactical-LQ/{Z}/{X}/{Y}.png',
         osm: 'http://otile2.mqcdn.com/tiles/1.0.0/osm/{Z}/{X}/{Y}.png'
      },
      geolat:  48.115293,
      geolon:  11.60218,
      minZoom: 2,
      maxZoom: 17,
      miniMapZoom: 11,
      defaultZoom: 12
    },

    /**
     * Property: user
     *  FIXME: This is not supposed to be here but should be a part of the user model
     *  und should be follow be a render update of the UI, when changed.
     *  Options are: DMS, QTH (To be done: DEC & GPS)
     */
    user: {
      userCoordPrefs: 'GPS',
      mapProvider: 'osm',
      geoLocationOptions: {
	  interval: 2300,
	  minacc: 49,
	  maxacc: 1001,
	  highacc: 'true',
	  maxage: 600000, // used cached locations 
	  timeout: 600
	}
    }
  };

});
