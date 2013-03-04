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
     * Class: MapContext
     *
     * map Context menu
     *
     * (see mapContext.png)
     */
    MapContext: BasePanel.extend({

      el: '#mapContext',
      template: templates.mapContext,

      events: {
        'click *[data-command]': 'callCommand',
      },

      initialize: function() {
        this.render();
      },

      callCommand: function(event) {
        var item = this.$(event.target);
        this.trigger('command:' + item.attr('data-command'), this.point);
        this.hide();
      },

      render: function() {
        this.$el.html(this.template());
        return this.el;
      },

      showFX: function(event){
        this.point = { x: event.clientX, y: event.clientY };
        this.$el.css( { 'left': this.point.x, 'top': this.point.y });
        this.$el.css( { 'display': 'block'});
        this.$el.fadeIn(350);
      },

      hideFX: function(){
        this.$el.fadeOut(350, this.$el.hide.bind(this.$el));
      }
    }),

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
      fadeDuration: 450,

      initialize: function() {
        this.world = this.options.world;
        this.render();
      },

      render: function() {
        this.$el.html(this.template());
      },

      show: function() {
       $('#bottomBaffle').animate({ height: 47, duration: this.fadeDuration });
       $('#bottomBaffle').fadeIn(this.fadeDuration);
      },

      hide: function(){
        var self = this;
       $('#bottomBaffle').animate({ height: 0, duration: this.fadeDuration });
       $('#bottomBaffle').fadeOut(this.fadeDuration);
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
      fadeDuration: 450,

      showFX: function(){
        this.$el.animate({ width: 245, duration: this.fadeDuration });
        this.$el.fadeIn(this.fadeDuration);
        this.visible = true;

      },

      hideFX: function(){
        var self = this;
        this.$el.animate({ width: 0, duration: this.fadeDuration });
        this.$el.fadeOut(this.fadeDuration);
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
      fadeDuration: 450,

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
        $('#topBaffle').animate({ height: 47, duration: this.fadeDuration });
        $('#topBaffle').fadeIn(this.fadeDuration);
      },

      hideFX: function(){
        var self = this;
        $('#topBaffle').animate({ height: 0, duration: this.fadeDuration });
        $('#topBaffle').fadeOut(this.fadeDuration);
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
        this.updateMapCenter();
        return this.el;
      }
    })
  };
});
