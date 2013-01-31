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
   */
  var MiniMap = panels.Base.extend({

    el: '#miniMapCanvas',
    frameId: 'minimap',

    initialize: function(){

      this.world = this.options.world;
      this.config = this.options.config;

      var self = this;
      this.world.on('change', function(event, data){
        // WIP
        //self.recenter();
      });
    },

    render: function(){
      var config = this.config;

      var self = this;

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

      /**
       * callbacks on map redraw
       * sets current mapCenter and mapZoom
       */
      modestmap.addCallback('drawn', function(m){
        self.world.set('mapCenter', modestmap.getCenter());
      });

      this.frame = modestmap;

      return modestmap;

    },

    showFX: function(){
      this.$el.animate({ bottom: 10, duration: 600  });
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
