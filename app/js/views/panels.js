define([
  'backbone',
  'templateMap'
], function(Backbone, templates) {

  var BasePanel = Backbone.View.extend({

    /**
     * both show() and hide() check for existence of matching FX()
     * if they exist just delegate to them!
     * sets this.visible to true
     */
    show: function() {
      if(this.showFX){
        this.showFX();
      } else {
        this.$el.show();
      }
      this.visible = true;
    },

    hide: function() {
      if(this.hideFX){
        this.hideFX();
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
     * extensible class for BasePanel elements
     */
    Base: BasePanel,

    /**
     * UI element to show map controls
     */
    Control: Backbone.View.extend({

      el: '#controlPanel',
      template: templates.controlPanel,

      initialize: function() {
        this.world = this.options.world

        var self = this;
        this.world.on('change', function(){
          self.render()
        });
      },

      /**
       * sets map.lat and map.lon for template
       */
      render: function(){
        var mapCenter = this.world.get('mapCenter');
        var mapData;
        if(mapCenter){
          mapData = { lat: mapCenter.lat, lon: mapCenter.lon };
        };
        var templateData = {map: mapData};
        this.$el.html(this.template(templateData));
        return this.el
      }
    }),

    /**
     * UI element for OverlaysPanel
     */
    Overlays: BasePanel.extend({

      el: '#featureOptionModal',
      template: templates.featureOptionModal,

      showFX: function(){
        this.$el.html( this.template( { ui: this.ui } ));
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
     * map ContextPanel
     */
    Context: BasePanel.extend({

      el: '#mapContext',
      template: templates.mapContext,

      showFX: function(){
        this.$el.css( { 'left': cursorX, 'top': cursorY });
        this.$el.css( { 'display': 'block'});
        this.$el.fadeIn(350);
      },

      hideFX: function(){
        var self = this;
        this.$el.fadeOut(350, function() { self.$el.hide(); });
      }
    }),

    /**
     * UI element for Options
     */
    Options: BasePanel.extend({

      el: '#userOptionModal',
      template: templates.userOptionModal,

      showFX: function(){
        this.$el.html( this.template( { ui: this.ui } ) );
        this.$el.css( { 'display': 'block'});
        this.$el.fadeIn(350);
      },

      hideFX: function(){
        var self = this;
        this.$el.fadeOut(350, function() { self.$el.hide(); });
      }
    }),

    /**
     * UI element to show current position in botttom left
     * gets model user and binds to all changes
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
        this.model.on('change', function () {
          self.render();
        });

        /**
         * create convienience accessors
         */
        this.user = this.model;
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
        this.model.set( 'usermode', 'walk' );
      },

      userModeDrive: function(event) {
        this.model.set( 'usermode', 'drive' );
      },

      render: function(){
        var templateData = { user: this.user.toJSON() };
        this.$el.html(this.template(templateData));
        return this.el;
      }
    })

  };

});