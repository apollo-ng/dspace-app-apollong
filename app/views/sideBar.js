define([
  'backbone'
], function(Backbone) {

  /**
   * Class: SideBar
   *
   * UI element for Sidebar
   *
   * (see overlaysPanel.png)
   */
  var SideBar = Backbone.View.extend({

    el: '#sidebar',
    fadeDuration: 450,

    show: function(){
      this.$el.animate({ width: 245, duration: this.fadeDuration });
      this.$el.fadeIn(this.fadeDuration);

    },

    hide: function(){
      this.$el.animate({ width: 0, duration: this.fadeDuration });
      this.$el.fadeOut(this.fadeDuration);
    }
  });

  return SideBar;
});
