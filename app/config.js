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
      { name: 'Hackerspaces (SpaceAPI)', url: '/examples/spaceapi/hackerspaces.json', type: 'SpaceAPI'},
      { name: 'Pools Munich', url: '/examples/geodata/pools-munich.json', type: 'GeoJSON'}
    ],

    plugins: ['hello', 'remotestorage', 'search', 'navigation', 'buddyradar'],

    /**
     * Property: map
     *
     * map defaults
     */
    map: {
      tileSets: {
        dspace: 'http://dspace.ruebezahl.cc:8888/v2/DSpace-Tactical-LQ/{Z}/{X}/{Y}.png',
        osm: 'http://otile2.mqcdn.com/tiles/1.0.0/osm/{Z}/{X}/{Y}.png',
        osmTransport: 'http://b.tile2.opencyclemap.org/transport/{Z}/{X}/{Y}.png',
        cmOW: 'http://a.tile.cloudmade.com/e4e152a60cc5414eb81532de3d676261/997/256/{Z}/{X}/{Y}.png'
      },
      geolat:  47.0667,
      geolon:  15.4333,
      minZoom: 2,
      maxZoom: 18,
      miniMapZoom: 11,
      defaultZoom: 13
    },

    /**
     * Property: user
     *
     *  Default configuration for the client
     */
    user: {
      userCoordPrefs: 'GPS',
      mapProvider: 'cmOW',
      geoLocationOptions: { // FIXME: seams not used in <DeviceFeed>
        interval: 2300,
        minacc: 49,
        maxacc: 1001,
        highacc: 'true',
        maxage: 1000,
        timeout: 60
	    },
      // Used for calculating routes.
      // Expected to be a routino installation (http://www.routino.org/), with at
      // least the "router.cgi" and "results.cgi" scripts accessible with CORS
      // headers.
      routinoURL: 'http://routing.heahdk.net/routino/',
      buddyradarURL: 'http://194.150.168.83:5000/dspace',
      buddyradarChannel: 'dspace'
    }
  };

});
