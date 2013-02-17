define([
  'ender',
  'backbone',
  'geofeeds/search',
  'templateMap',
  'template/helpers/renderPos',
  'template/helpers/renderAcc',
  'template/helpers/ms2kmh',
], function($, Backbone, SearchFeed, templates, renderPos, renderAcc, ms2kmh) {

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
        'click #userGeoStatus': 'toggleGeoAPI',
        'submit #searchForm': 'createSearch'
      },

      initialize: function() {
        var self = this;

        /**
         * Maedneasz: create konwienienz accessors
         */
        this.world = this.model;
        this.ui = this.options.ui;

        this.world.user.on('location-changed', this.updateUserLocation.bind(this));
        this.world.on('change', this.updateMapCenter.bind(this));

      },

      createSearch: function(event) {
        event.preventDefault();
        var query = event.target.query.value;
        var index = this.world.addFeed(new SearchFeed({ query: query, extent: this.ui.map.frame.getExtent() }), true);
      },

      toggleGeoAPI: function() {
        // FIXME: userGeoStatus should be in the user model to have more flexible control over it
        if (this.userGeoStatus == '1') {
          this.world.user.feed.unwatch();
          this.userGeoStatus = 0;
          $('#userGeoStatus').removeClass('enabled');
          $('#userGeoStatus').addClass('disabled');
        } else {
          this.world.user.feed.watch();
          $('#userGeoStatus').removeClass('disabled');
          $('#userGeoStatus').addClass('enabled');
          this.userGeoStatus = 1;
        }
      },

      updateUserLocation: function() {
        var loc = this.world.user.getLocation();
        this.$('*[data-name="user-location"]').
          attr('data-lat', loc.lat).
          attr('data-lon', loc.lon);
        this.renderPositions();
      },

      updateMapCenter: function() {
        var center = this.world.get('mapCenter');
        this.$('*[data-name="map-center"]').
          attr('data-lat', center.lat).
          attr('data-lon', center.lon);
        this.renderPositions();
      },

      /**
       * Method: renderPositions
       *
       * rerender everything that can change with a moving user
       */
      renderPositions: function() {
        this.$('*[data-format=position]').forEach(function(e) {
          var el = this.$(e);
          el.html(renderPos(el.attr('data-lat'), el.attr('data-lon'), this.world.user.get('userCoordPrefs')));
        }.bind(this));

        this.$('*[data-name=user-speed]').forEach(function(e) {
          var el = this.$(e);
          //el.html(this.world.user.feed.position.coords.speed);
        }.bind(this));
        if (this.world.user.feed.position.coords){
          this.$('[data-name=user-accuracy]').html(renderAcc(this.world.user.feed.position.coords.accuracy));
          this.$('[data-name=user-speed]').html(ms2kmh(this.world.user.feed.position.coords.speed));
          if (this.world.user.feed.position.coords.altitude){
            this.$('[data-name=user-altitude]').html(this.world.user.feed.position.coords.altitude);
          }
        }

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
