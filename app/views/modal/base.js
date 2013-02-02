define([
  'backbone',
  'views/panels'
], function(Backbone, panels) {
  return panels.Base.extend({
    el: '#modal'
  });
});