define([
  'underscore',
  'remoteStorage-locations',
  './base'
], function(_, locations, Base) {

  return Base.extend({

    watch: function() {
      locations.watchCollection(
        this.name, function(action, feature) {
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
        }.bind(this)
      );
    },

    makeTitle: function() {
      return 'remoteStorage: ' + this.name;
    }

  });

});