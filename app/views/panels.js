define([
  'backbone',
  'templateMap'
], function(Backbone, templates) {

  /**
   * Class: Panel
   */
  var BasePanel = Backbone.View.extend({

    /**
     * both show() and hide() check for existence of matching FX()
     * if they exist just delegate to them!
     * sets this.visible to true
     */
    show: function() {
      if(this.showFX){
        this.showFX.apply(this, arguments);
      } else {
        this.$el.show();
      }
      this.visible = true;
    },

    hide: function() {
      if(this.hideFX){
        this.hideFX.apply(this, arguments);
      } else {
        this.$el.hide();
      }
      this.visible = false;
    },

    /**
     * checks this.visible and shows or hides panel
     */
    toggle: function(){
      if(this.visible) {
        this.hide();
      } else {
        this.show();
      }
    }
  });

  return {

    /**
     * Class: BasePanel
     *
     * extensible class for BasePanel elements
     */
    Base: BasePanel,

    /**
     * Class: ControlPanel
     *
     * UI element to show map controls
     *
     * (see controlPanel.png)
     */
    Control: Backbone.View.extend({

      el: '#controlPanel',
      template: templates.controlPanel,

      initialize: function() {
        this.world = this.options.world;

        this.$el.html(this.template());
      }

    }),

    /**
     * Class: OverlaysPanel
     *
     * UI element for OverlaysPanel
     *
     * (see overlaysPanel.png)
     */
    Overlays: BasePanel.extend({

      el: '#featureOptionModal',
      template: templates.featureOptionModal,

      showFX: function(){
        this.$el.html( this.template());
        this.$el.css( { 'display': 'block'});
        this.$el.fadeIn(350);
        this.visible = true;

      },

      hideFX: function(){
        var self = this;
        this.$el.fadeOut(350, function() { self.$el.hide(); });
        this.visible = false;
      }
    }),

    /**
     * Class: StatusPanel
     *
     * UI element to show current position in botttom left
     * gets model user and binds to all changes
     *
     * (see statusPanel.png)
     *
     */
    Status: BasePanel.extend({

      el: '#statusPanel',
      template: templates.statusPanel,

      events: {
          'click #userModeWalk': 'userModeWalk'
        , 'click #userModeDrive': 'userModeDrive'
      },

      initialize: function() {
        var self = this;

        /**
         * Maedneasz: create konwienienz accessors
         */
        this.world = this.model;

        this.world.user.on('change', function () {
          self.render();
        });

        this.world.on('change', function () {
          self.render();
        });

      },

      showFX: function(){
        this.$el.show();
        this.$el.fadeIn(450);
      },

      hideFX: function(){
        var self = this;
        this.$el.fadeOut(450, function() { self.$el.hide(); });
      },

      /**
       *  help the system making decisions based
       *  on the user's mode of movement
       */

      userModeWalk: function(event) {
        this.world.user.save( { 'usermode' : 'walk' } );
      },

      userModeDrive: function(event) {
        this.world.user.save( { 'usermode' : 'drive' } );
      },

      /**
       * sets map.lat and map.lon for template
       */
      render: function(){
        var mapCenter = this.world.get('mapCenter');
        var templateData = { map: mapCenter, user: this.world.user.toJSON() };
        this.$el.html(this.template(templateData));
        return this.el;
      }
    })
  };
});
