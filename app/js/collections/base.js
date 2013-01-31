define(['backbone', 'models/feature'], function(Backbone, Feature) {

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

  return FeatureCollection;
});