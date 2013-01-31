define([
  'models/world'
], function(World) {

  return {
    init: function(config) {
      return new World({ config : config });
    }
  };

});
