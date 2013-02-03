define([
  'backbone',
  'views/panels'
], function(Backbone, panels) {

  /**
   * Class: Modal.Base
   */
  return panels.Base.extend({
    el: '#modal',

    showFX: function(){
      this.$el.html( this.template(this) );
      this.$el.css( { 'display': 'block'});
      this.$el.fadeIn(350);
    },

    hideFX: function(){
      var self = this;
      this.$el.fadeOut(350, function() { self.$el.hide(); });
    }

  });
});