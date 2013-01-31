define([], function() {

  /**
   * config for initializing DSpace Wrorld
   */
  return {
    geoFeeds: [
      { name: 'OpenWiFi Munich', url: '/test/openwifi-munich.json', type: 'CORS'},
      { name: 'Hackerspaces Munich', url: '/test/hackerspaces-munich.json', type: 'CORS'},
      { hub: 'open-reseource.org', type: 'DSNP'}

    ],

    map: {
      tileSet: {
        template: 'http://dspace.ruebezahl.cc:8888/v2/DSpace-Tactical-LQ/{Z}/{X}/{Y}.png'
      },
      geolat:  48.115293,
      geolon:  11.60218,
      minZoom: 13,
      maxZoom: 17,
      miniMapZoom: 11,
      defaultZoom: 12
    },

    /**
     *  FIXME: This is not supposed to be here but should be a part of the user model
     *  und should be follow be a render update of the UI, when changed.
     *  Options are: DMS, QTH (To be done: DEC & GPS)
     */
    user: {
      prefCoordSys: 'GPS'
    }
  };

});
