define([
  'backbone',
  'views/panels'
], function(Backbone, panels) {

  /**
   * Class: Modal.Base
   */
  return panels.Base.extend({
    el: '#modal',

    render: function() {
      this.$el.find('#modal-content').html(this.template());
    },

    showFX: function(){
      this.render();
      this.$el.css( { 'display': 'block'});
      this.$el.fadeIn(350);
    },

    hideFX: function(){
      var self = this;
      this.$el.fadeOut(350, function() { self.$el.hide(); });
    }

  });
});
