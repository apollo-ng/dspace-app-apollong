
define([
  'underscore',
  'bean',
  'bonzo',
  'qwery'
], function(_, bean, bonzo, qwery) {

  var $ = function(selector) {
    var result = bonzo(qwery(selector));
    for(var key in bean) {
      result[key] = function() {
        var tl = this.length;
        for(var i=0;i<tl;i++) {
          bean[key]([this[i]].concat(Array.prototype.slice.call(arguments)));
        }
        return this;
      };
    }

    return result;
  };

  // hack to make Backbone detect our $
  window.ender = $;

  return $;

});
