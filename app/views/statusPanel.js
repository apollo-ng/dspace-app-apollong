define([
  'ender',
  'backbone',
  'templateMap',
  'template/helpers/renderPos',
  'template/helpers/renderAcc',
  'template/helpers/ms2kmh',
], function($, Backbone, templates, renderPos, renderAcc, ms2kmh) {

  /**
   * Class: StatusPanel
   *
   * UI element to show current position in botttom left
   * gets model user and binds to all changes
   *
   * (see statusPanel.png)
   *
   */
  var StatusPanel =  Backbone.View.extend({

    el: '#statusPanel',
    template: templates.statusPanel,

    events: {
      'click #userGeoStatus': 'toggleGeoAPI',
    },

    initialize: function() {

      /**
       * Maedneasz: create konwienienz accessors
       */
      this.world = this.options.world;
      this.ui = this.options.ui;

      this.world.user.on('location-changed', this.updateUserLocation.bind(this));
      this.world.on('change', this.updateMapCenter.bind(this));

    },

    toggleGeoAPI: function() {
      // FIXME: userGeoStatus should be in the user model to have more flexible control over it
      if (this.userGeoStatus === '1') {
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
     *
     * FIXME: tidy up!
     */
    renderPositions: function() {
      this.$('*[data-format=position]').forEach(function(e) {
        var el = this.$(e);
        el.html(renderPos(el.attr('data-lat'), el.attr('data-lon'), this.world.user.get('userCoordPrefs')));
      }.bind(this));

      var coords = this.world.user.feed.position.coords;
      if (coords){
        this.$('[data-name=user-accuracy]').html(renderAcc(coords.accuracy));
        this.$('[data-name=user-speed]').html(ms2kmh(coords.speed));
        if (coords.altitude){
          this.$('[data-name=user-altitude]').html(coords.altitude);
        }
      }
    },

    /**
     * sets map.lat and map.lon for template
     */
    render: function(){
      this.$el.html(this.template({user: this.world.user.toJSON() }));
      this.updateMapCenter();
      return this.el;
    }
  });

  return StatusPanel;
});
