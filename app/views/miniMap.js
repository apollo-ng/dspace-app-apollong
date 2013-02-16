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
    
    
    /**
     * Method: showFX
     * do a fancy minimap fade-in animation.
     */
    showFX: function(){
      //this.$el.show()
      this.$el.animate({ height: 178, duration: MiniMap.fadeDuration });
      this.$el.fadeIn(MiniMap.fadeDuration);
    },
    
    /**
     * Method: hideFx
     * do a fancy minimap fade-out animation.
     */
    hideFX: function(){
      this.$el.animate({ height: 0, duration: MiniMap.fadeDuration  });
      this.$el.fadeOut(MiniMap.fadeDuration);
      setTimeout(function(){
        this.$el.hide()
      }, MiniMap.fadeDuration);
    },

    recenter: function(){
      var mapCenter = this.world.get('mapCenter');
      if(mapCenter && this.frame){
        this.frame.setCenter(mapCenter);
      }
    }
  }, {
    /*
     * Class Properties go here
     * see http://stackoverflow.com/questions/6142985/where-should-i-put-view-related-constants-backbone-js
     * is this good?
     */
     
     
     fadeDuration: 600,
    
    
  });

  return MiniMap;

});
