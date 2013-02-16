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
      { name: 'OpenWiFi Munich', url: '/examples/geodata/openwifi-munich.json', type: 'CORS'},
      { name: 'Hackerspaces Munich', url: '/examples/geodata/hackerspaces-munich.json', type: 'CORS'},
      { name: 'Pools', url: '/examples/geodata/pools-munich.json', type: 'CORS'},
      { name: 'test', type: 'remoteStorage' },
      // { hub: 'open-resource.org', type: 'DSNP'},
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
        osm: 'http://otile2.mqcdn.com/tiles/1.0.0/osm/{Z}/{X}/{Y}.png',
        osmTransport: 'http://b.tile2.opencyclemap.org/transport/{Z}/{X}/{Y}.png'
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
     *
     *  Default configuration for the client
     */
    user: {
      userCoordPrefs: 'GPS',
      mapProvider: 'osm',
      geoLocationOptions: {
        interval: 2300,
        minacc: 49,
        maxacc: 1001,
        highacc: 'true',
        maxage: 21600,
        timeout: 60
	  }
    }
  };

});
