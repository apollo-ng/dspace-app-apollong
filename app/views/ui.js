define([
  'backbone',
  'ender',
  'remoteStorage',
  'views/panels',
  'views/featureBox',
  'views/map',
  'views/miniMap',
  'views/modal/userOptions',
  'views/modal/overlayManager',
  'views/modal/featureDetails',
  'views/modal/addFeature',
  'template/helpers/renderPos'
], function(Backbone, $, remoteStorage, panels, FeatureBox, Map, MiniMap, UserOptions, OverlayManager, FeatureDetails, AddFeature, renderPos) {


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
     * Events: events
     *
     * delegting events on UI
     */
    events: {
        'click #toggleFeatureBox': 'boxToggle'
      , 'click #toggleMiniMap': 'miniMapToggle'
      , 'click #toggleFullscreen': 'fullscreenToggle'
      , 'click #addOverlay': 'toggleOverlaysManager'
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
      this.aether.on('select-feature', function( feature ){
        var id = feature.get('id');
        this.dspace.updateState({
          feature: id,
          modal: undefined
        });
        
        //if(this.world.get('currentFeatureId') === id) {
        //  this.map.jumpToFeature(feature);
        //}
        
        this.map.jumpToFeature(feature);
      }.bind(this));



      /**
       * Property: map
       *
       * reference to the <Map> from
       *
       * passed to <MiniMap>
       * used to jump <Map>
       */

      this.map = new Map({ world: this.world, dspace: this.dspace });

      /**
       * Property: featureBox
       */
      this.featureBox = new FeatureBox({ world: this.world, aether: this.aether, feeds: this.world.geoFeeds});

      this.listenTo(this.featureBox, 'change-tab', function(collection) {
        if(this.modal && this.modal.setCollection) {
          this.modal.setCollection(collection);
        }
      }.bind(this));

      /**
       * creates minimap
       */
      this.miniMap = new MiniMap({world: this.world, map: this.map});

      /**
       * creates statusPanel
       */
      this.statusPanel = new panels.Status({model: this.world, ui: this});
      this.controlPanel = new panels.Control({world: this.world });

      /**
       *  creates Sidebar
       */
      this.sideBar = new panels.SideBar();

      this.world.on('change:currentFeatureId', function() {
        var feature = this.world.getCurrentFeature();
        
        //disabled jumps for clicks on the map for now
        //FIXME: this is not the right place to do that.
        //Rethink on what events we actually want to move the map
       
        //if(feature) {
        // this.map.jumpToFeature(feature);
        //}
      }.bind(this));

      this.world.on('change:currentModal', function() {
        var modalName = this.world.get('currentModal');
        if(modalName) {
          var modal = this.modals[modalName];
          if(modal) {
            this.modalName = modalName;
            modal.apply(this, []);
            if(this.modal) {
              this.listenTo(this.modal, 'close', function() {
                this.dspace.updateState({ modal: undefined });
              }.bind(this));
              setTimeout(function() {
                this.$('*[data-format=position]').forEach(function(e) {
                  var el = this.$(e);
                  el.html(renderPos(el.attr('data-lat'), el.attr('data-lon'),
                                    this.world.user.get('userCoordPrefs')));
                }.bind(this));
              }.bind(this), 0);
            }
          } else {
            console.error('modal not found', modalName);
          }
        } else {
          this.closeModal();
        }
      }.bind(this));

      function setupRemoteStorage() {
        remoteStorage.util.silenceAllLoggers();
        if(this.world.user.get('remoteStorage')) {
          $(document.body).prepend('<div id="remotestorage-connect"></div>');
          remoteStorage.claimAccess('locations', 'rw').
            then(function() {
              remoteStorage.displayWidget('remotestorage-connect');
              remoteStorage.schedule.disable();
            });
        } else {
          $('#remotestorage-connect').remove();
          remoteStorage.flushLocal();
        }
      }

      this.world.user.on('change:remoteStorage', setupRemoteStorage.bind(this));
      setupRemoteStorage.apply(this, []);
    },

    modals: {

      'userOptions': function() {
        this.modal = new UserOptions({
          user: this.world.user,
          aether: this.aether
        });
        this.modal.show();
      },

      'featureDetails': function() {
        var feature = this.world.getCurrentFeature();
        if(feature) {
          this.modal = new FeatureDetails({
            feature: feature
          });
          this.modal.show();
        } else {
        }
      },

      'addFeature': function() {
        this.modal = new AddFeature({ world: this.world });
        this.modal.setCollection(this.featureBox.getCurrentCollection());
        this.modal.render();
        this.modal.show();
      },

      'overlayManager': function() {
        this.modal = new OverlayManager();
        this.modal.render();
        this.modal.show();
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

    /**
     * Method: closeModal
     *
     * Close the current modal dialog, then <cleanupModal>
     */
    closeModal: function() {
      if(this.modal) {
        this.modal.hide();
        this.cleanupModal();
      }
    },

    /**
     * Method: cleanupModal
     *
     * Removes all reference to the current modal dialog.
     *
     */
    cleanupModal: function() {
      if(this.modal) {
        this.stopListening(this.modal);
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
     * Method: toggleOverlaysManager
     *
     * toggles <OverlaysManager>
     */
    toggleOverlaysManager: function(){
      console.log('overlaypanel');
      this.overlayManager = new OverlayManager();
      this.overlayManager.render();
      this.overlayManager.show();
    },

    /**
     * Method: toggleUserOptions
     *
     * toggles <Modal.UserOptions> using <showUserOptions>/<hideUserOptions>
     */
    toggleUserOptions: function() {
      if(this.modalName === 'userOptions') {
        this.dspace.updateState({
          modal: undefined
        });
      } else {
        this.dspace.updateState({
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
