define(['./base', 'reqwest'], function(FeatureCollection, Reqwest) {

  /**
   * Class: FeatureCollectionCORS
   *
   * Gets geoJSON collection over CORS
   */
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

  return FeatureCollectionCORS;

});
