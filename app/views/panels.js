define([
  'ender',
  'backbone',
  'templateMap',
  'template/helpers/renderPos'
], function($, Backbone, templates, renderPos) {

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
        this.render();
      },

      render: function() {
        this.$el.html(this.template());
      },

      show: function() {
       $('#bottomBaffle').animate({ bottom: 0, duration: 600  });
       $('#bottomBaffle').fadeIn(600);
      },

      hide: function(){
        var self = this;
       $('#bottomBaffle').animate({ bottom: -75, duration: 600  });
       $('#bottomBaffle').fadeOut(600);
      },

    }),


    /**
     * Class: SideBar
     *
     * UI element for Sidebar
     *
     * (see overlaysPanel.png)
     */
    SideBar: BasePanel.extend({

      el: '#sidebar',

      showFX: function(){
        this.$el.animate({ right: 0, duration: 600  });
        this.$el.fadeIn(600);
        this.visible = true;

      },

      hideFX: function(){
        var self = this;
        this.$el.animate({ right: -245, duration: 600  });
        this.$el.fadeOut(600);
        this.visible = false;
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

        this.world.user.on('change', this.updateUser.bind(this));
        this.world.on('change', this.updateMapCenter.bind(this));

      },

      updateUser: function() {
        var user = this.world.user.toJSON();
        this.$('*[data-name="user-location"]').
          attr('data-lat', user.geoLocation.coords.latitude).
          attr('data-lon', user.geoLocation.coords.latitude);
        this.renderPositions();
      },

      updateMapCenter: function() {
        var center = this.world.get('mapCenter');
        this.$('*[data-name="map-center"]').
          attr('data-lat', center.lat).
          attr('data-lon', center.lon);
        this.renderPositions();
      },

      renderPositions: function() {
        this.$('*[data-format=position]').forEach(function(e) {
          var el = this.$(e);
          el.text(renderPos(el.attr('data-lat'), el.attr('data-lon'), this.world.user.get('userCoordPrefs')));
        }.bind(this));
      },

      showFX: function() {
       $('#topBaffle').animate({ top: 0, duration: 600  });
       $('#topBaffle').fadeIn(600);
      },

      hideFX: function(){
        var self = this;
       $('#topBaffle').animate({ top: -75, duration: 600  });
       $('#topBaffle').fadeOut(600);
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
        this.$el.html(this.template({user: this.world.user.toJSON() }));
        return this.el;
      }
    })
  };
});
