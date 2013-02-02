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
      this.config = this.options.config;

      this.world.on('change', function(event, data){
        this.recenter();
      }.bind(this));
    },

    jumpMap: function(event) {
      console.log('evt', event);
      var offset = this.$el.offset();
      console.log('before jumpMap', JSON.stringify(this.world.get('mapCenter')));
      this.world.set('mapCenter', this.frame.pointLocation(
        new MM.Point(event.clientX - offset.left , event.clientY - offset.top)
      ));
      console.log('after jumpMap', JSON.stringify(this.world.get('mapCenter')));
    },

    render: function(){
      var config = this.config;

      var template = config.tileSet.template; //FIXME introduce BaseMap
      var layer = new MM.TemplatedLayer(template); //FIXME fix what? @|@

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
