define([
  'backbone',
  'modestmaps',
  'easey_handlers',

  'views/panels'
], function(Backbone, MM, easey_handlers, panels) {

  /**
   * Class: MiniMap
   *
   * UI element for showin mini map
   *
   * (see minimap.png)
   */
  var MiniMap = panels.Base.extend({

    el: '#miniMap',
    frameId: 'miniMap',

    events: {
      // FIXME: change this to 'click' (without killing 'dragging')
      "dblclick": "jumpMap",
      'contextmenu': function(event) { event.preventDefault(); }
    },

    initialize: function(){

      this.world = this.options.world;
      this.config = this.options.map.config;
      this.map = this.options.map

      this.world.on('change', function(event, data){
        this.recenter();
      }.bind(this));
      /**
       * Event: user:mapProvider
       * 
       * listens to changed user configuration and changes minimap with <MiniMap.switchBaseMap>
       */
      this.world.user.on('change:mapProvider', function(event, data){
        this.switchBaseMap();
      }.bind(this));
    },
    
    /**
     * Method: jumpMap
     * 
     * sets <World.mapCenter> which recenters the map via <world:mapCenter> and <Map.recenter>
     */
    jumpMap: function(event) {
      var offset = this.$el.offset();
      this.world.set('mapCenter', this.frame.pointLocation(
        new MM.Point(event.clientX - offset.left , event.clientY - offset.top)
      ));
    },
    
    /**
     * Method: switchBaseMap
     * changes the basemap using <Map>.
     */
    switchBaseMap: function(){
      //FIXME: this is redundant with Map.js
      var layer = this.map.createBaseMap();
      this.frame.setLayerAt(0, layer);
      //this.frame.removeLayerAt(0);
      this.frame.draw();
    },

    render: function(){
      var config = this.config;
      //FIXME should not get from window
      var layer = this.map.createBaseMap();
      
      var modestmap = new MM.Map(
        this.frameId,
        layer,
        null,
        [new easey_handlers.TouchHandler(),
         new easey_handlers.DragHandler(),
         new easey_handlers.MouseWheelHandler()]
      );

      /**
       *  setup boundaries
       */
      var location = new MM.Location(config.geolat, config.geolon);

      /**
       * show and zoom map
       */
      modestmap.setCenterZoom(location, config.miniMapZoom);

      this.frame = modestmap;

      return modestmap;

    },

    showFX: function(){
      this.$el.animate({ bottom: 47, duration: 600  });
      this.$el.fadeIn(600);
    },
    hideFX: function(){
      this.$el.animate({ bottom: -250, duration: 600  });
      this.$el.fadeOut(600);
    },

    recenter: function(){
      var mapCenter = this.world.get('mapCenter');
      if(mapCenter && this.frame){
        this.frame.setCenter(mapCenter);
      }
    }
  });

  return MiniMap;

});
