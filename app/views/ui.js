define([
  'backbone',
  'views/panels',
  'views/featureBox',
  'views/map',
  'views/miniMap',
  'views/modal/userOptions',
  'views/modal/featureDetails',
  'template/helpers/renderPos'
], function(Backbone, panels, FeatureBox, Map, MiniMap, UserOptions, FeatureDetails, renderPos) {


  // /**
  //  * X-Browser Fullscreen API Calls
  //  */
  // function reqBFS () {
  //   var e = document.documentElement;
  //   if (e.requestFullscreen) {
  //     e.requestFullscreen();
  //   } else if (e.mozRequestFullScreen) {
  //     e.mozRequestFullScreen();
  //   } else if (e.webkitRequestFullScreen) {
  //     e.webkitRequestFullScreen();
  //   }
  // }

  // function exitBFS () {
  //   if (document.exitFullscreen) {
  //     document.exitFullscreen();
  //   } else if (document.mozCancelFullScreen) {
  //     document.mozCancelFullScreen();
  //   } else if (document.webkitCancelFullScreen) {
  //     document.webkitCancelFullScreen();
  //   }
  // }


  /**
   * Class: UI
   *
   * elements:
   * * <overlaysPanel>
   * * <FeatureBox>
   * * <MiniMap>
   * * <StatusPanel>
   * * <ControlPanel>
   */
  var UI = Backbone.View.extend({

    /**
     * Property: el
     *
     * DOM element which will host UI '#id'
     *
     * Property: $el
     *
     * Backbone wrapped element to reuse
     */
    el: '#ui',

    /**
     * Property: fullScreen
     *
     * keeps state if UI fullScreen defaulting to false
     */
    fullScreen: false,

    /**
     * Property: overlaysPanel
     *
     * <OverlaysPanel> *ui element* for managing active overlays
     */
    overlaysPanel: new panels.Overlays(),

    /**
     * Events: events
     *
     * delegting events on UI
     */
    events: {
        'click #toggleFeatureBox': 'boxToggle'
      , 'click #toggleMiniMap': 'miniMapToggle'
      , 'click #toggleFullscreen': 'fullscreenToggle'
      , 'click #featureOptions': 'toggleOverlaysPanel'
      , 'click #userOptions': 'toggleUserOptions'
    },

    /**
     * Method: initialize
     */
    initialize: function(){
      var self = this;

      /**
       * Property: world
       *
       * reference to the <World> from init options
       */
      this.world = this.options.world;

      /**
       * Property: dspace
       *
       * reference to the global Backbone.Router called <DSpace>
       */
      this.dspace = this.options.dspace;

      /**
       * Property: map
       *
       * reference to the <Map> from
       *
       * passed to <MiniMap>
       * used to jump <Map>
       */

      this.map = new Map({ world: this.world });

      this.map.on('marker-click', function(uuid) {
        this.dspace.jump({
          feature: uuid,
          modal: 'featureDetails'
        });
      }.bind(this));

      /**
       * Property: aether
       *
       * event aggregator from <World>
       */
      this.aether = this.world.aether;


      /**
       * Event: feature:current
       *
       * jumps map to feature set to current
       */
      this.aether.on('feature:current', function( feature ){
        this.dspace.jump({
          feature: feature.get('uuid'),
          modal: undefined
        });
      }.bind(this));

      /**
       * Property: featureBox
       */
      this.featureBox = new FeatureBox({ aether: this.aether, feeds: this.world.geoFeeds});

      /**
       * creates minimap
       */
      this.miniMap = new MiniMap({world: this.world, config: this.map.config});

      /**
       * creates statusPanel
       */
      this.statusPanel = new panels.Status({model: this.world});
      this.controlPanel = new panels.Control({world: this.world });

      /**
       *  creates Sidebar
       */
      this.sideBar = new panels.SideBar();

      this.world.on('change:currentFeatureId', function() {
        var feature = this.world.getCurrentFeature();
        if(feature) {
          console.log('jumping to feature', feature);
          this.map.jumpToFeature(feature);
        } else {
          console.log('no current feature set!', this.world.get('currentFeatureId'), 'in', Object.keys(this.world.featureIndex));
        }
      }.bind(this));

      this.world.on('change:currentModal', function() {
        var modalName = this.world.get('currentModal');
        if(modalName) {
          var modal = this.modals[modalName];
          if(modal) {
            this.modalName = modalName;
            modal.apply(this, []);
            setTimeout(function() {
              this.$('*[data-format=position]').forEach(function(e) {
                var el = this.$(e);
                el.text(renderPos(el.attr('data-lat'), el.attr('data-lon'),
                                  this.world.user.get('userCoordPrefs')));
              }.bind(this));
            }.bind(this), 0);
          } else {
            console.log('modal not found', modal);
          }
        }
      }.bind(this));

    },

    modals: {

      'userOptions': function() {
        this.modal = new UserOptions({
          user: this.world.user,
          aether: this.aether
        });
        this.modal.show();
        console.log('show modal user');
      },

      'featureDetails': function() {
        var feature = this.world.getCurrentFeature();
        if(feature) {
          this.modal = new FeatureDetails({
            feature: feature
          });
          this.modal.on('close', function() {
            this.dspace.jump({ modal: false });
          }.bind(this));
          this.modal.show();
        } else {
          console.log('show feature details, but no feature');
        }
      }

    },

    /**
     * Method: render
     *
     * render all elements and sets them visible
     */
    render: function() {
      this.map.render();

      this.featureBox.render();
      this.featureBox.visible = true;

      this.miniMap.render();
      this.miniMap.visible = true;

      this.statusPanel.render();
      this.statusPanel.visible = true;

      this.controlPanel.render();
      this.controlPanel.visible = true;

      this.sideBar.render();
      this.sideBar.visible = true;

    },

    reset: function() {
      this.closeModal();
    },

    closeModal: function() {
      if(this.modal) {
        this.modal.hide();
        delete this.modal;
        delete this.modalName;
      }
    },

    /**
     * Method: boxToggle
     *
     * toggles <FeatureBox>
     */
    boxToggle: function() {
      this.featureBox.toggle();
    },

    /**
     * Method: miniMapToggle
     *
     * toggles <MiniMap>
     */
    miniMapToggle: function(){
      this.miniMap.toggle();
    },

    /**
     * Method: toggleOverlaysPanel
     *
     * toggles <OverlaysPanel>
     */
    toggleOverlaysPanel: function(){
      this.overlaysPanel.toggle();
    },

    /**
     * Method: toggleUserOptions
     *
     * toggles <Modal.UserOptions> using <showUserOptions>/<hideUserOptions>
     */
    toggleUserOptions: function() {
      if(this.modalName === 'userOptions') {
        this.dspace.jump({
          modal: false
        });
      } else {
        this.dspace.jump({
          modal: 'userOptions'
        });
      }
    },

    /**
     * Method: hideUserOptions
     *
     * Hides the <Modal.UserOptions> view and cleans up it's reference.
     *
     */
    hideUserOptions: function() {
      if(! this.userOptions) {
        return;
      }
      this.userOptions.hide();
      delete this.userOptions;
    },

    /**
     * Method: showUserOptions
     *
     * Creates a <Modal.UserOptions> view and displays it.
     */
    showUserOptions: function() {
      if(this.userOptions) {
        return;
      }
    },

    hideFeatureDetails: function() {
      if(this.featureDetails) {
        this.featureDetails.hide();
        delete this.featureDetails;
      }
    },

    showFeatureDetails: function() {
      if(this.featureDetails) {
        return;
      }
      var feature = this.world.getCurrentFeature();
      if(feature) {
        this.featureDetails = new FeatureDetails({
          feature: feature
        });
        this.featureDetails.show();
        console.log('rendered featureDetails');
      }
    },

    /**
     * Method: fullscreenToggle
     *
     * toggles fulls creen mode
     */
    fullscreenToggle: function() {
      if(this.fullScreen) {
        this.miniMap.show();
        this.statusPanel.show();
        this.controlPanel.show();
        this.sideBar.show();
        this.fullScreen = false;
      } else {
        this.miniMap.hide();
        this.statusPanel.hide();
        this.controlPanel.hide();
        this.sideBar.hide();
        this.fullScreen = true;
      }
    }

  });

  return UI;

});
