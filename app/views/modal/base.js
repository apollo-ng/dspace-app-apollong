define([
  'backbone',
], function(Backbone) {

  /**
   * Class: Modal.Base
   */
  return Backbone.View.extend({
    el: '#modal',

    data: {},

    render: function() {
      var content = this.template(this.data);
      this.$el.find('#modalContent').html(content);
    },

    show: function(){
      this.render();
      this.$el.css( { 'display': 'block'});
      this.$el.fadeIn(350);
    },

    hide: function(){
      this.$el.fadeOut(350, function(){ this.$el.hide(); }.bind(this));
    }
  });
});
