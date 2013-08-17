require(["ender", 'app/config'], function($, config){

  mocha.setup('bdd');

  mocha.globals(['provide', '$', 'ender', '_', 'Backbone', 'nodeRequire', 'mapbox', 'mmg', 'mmg_interaction', 'Handlebars', 'easey', 'easey_handlers', 'dspace', 'world']);

  var expect = chai.expect;

  describe('dspace', function(){

    var positionCbs = [];

    before(function(done){
      navigator.geolocation = {};
      navigator.geolocation.watchPosition = function(callback) {
        positionCbs.push(callback);
        setTimeout(function() {
          callback({ coords: { latitude: 48.115293, longitude: 11.60218 } });
        }, 0);
      };
      setTimeout(function() {
        done();
      }, 1000);
    });

    describe('init', function(){
      it("creates world", function(){
        expect(dspace.world).to.be.ok;
      });

      it("creates ui", function(){
        expect(dspace.ui).to.be.ok;
      });

      it("renders ui");
      it("starts backbone history");
    });


    describe('world', function(){
      describe('init', function(){
        it("gets config", function(){
          expect(dspace.world.config).to.be.ok;
        });

        it("creates featureIndex", function(){
          expect(dspace.world.featureIndex).to.be.ok;
        });

        it("creates user feed");

        it("creates aether", function(){
          expect(dspace.world.aether).to.be.ok;
        });

        it("binds on user:change");
        it("trigers user:change on aether");
        it("binds on aether:remove-feed");
      });
    });

    describe('user', function(){
      describe('init', function(){
        it("setups LocalStorage");
        it("detects remoteStorage");
        it("sets defaults");

        it("creates DeviceFeed", function(){
          expect(dspace.world.user.feed).to.be.ok;
        });

        it("binds to changes of avatar position");

        it("watches the geolocation", function() {
          expect(positionCbs.length).to.be.equal(1);
        });
      });
    });

    describe('map', function(){
      it("displays the tikiman", function() {
        var tikiman;
        $('img').forEach(function(img) {
          if(img.src.match(/\/assets\/images\/tiki-man.png$/)) {
            tikiman = img;
          }
        });
        expect(tikiman).to.be.ok;
      });
    });

    describe('ui', function(){
      describe('init', function(){
        it("creates Map");
        it("creates MiniMap");
        it("creates StatusPanel");
        it("creates ControlPanel");
        it("creates SideBar");
      });

      describe('render', function(){
        it("renders Map");
        it("renders MiniMap and sets visible");
        it("renders StatusPanel and sets visible");
        it("renders ControlPanel and sets visible");
        it("renders SideBar and sets visible");
      });

      describe('interaction', function(){
        it("toggles MiniMap", function(){
          var miniMap = dspace.ui.miniMap;
          $('#toggleMiniMap').click();
          expect(miniMap.visible).to.not.be.ok;
          $('#toggleMiniMap').click();
          expect(miniMap.visible).to.be.ok;
        });

        it("toggles SideBar", function(){
          var sideBar = dspace.ui.sideBar;
          $('#toggleSideBar').click();
          expect(sideBar.visible).to.not.be.ok;
          $('#toggleSideBar').click();
          expect(sideBar.visible).to.be.ok;
        });

        it("toggles UserOptions", function(){
          var ui = dspace.ui;
          $('#userOptions').click();
          expect(ui.modal).to.be.ok;
          $('#closeModal').click();
          expect(ui.modal).to.not.be.ok;
        });

        it("toggles OverlayManager", function(){
          var ui = dspace.ui;
          $('#addOverlay').click();
          expect(ui.modal).to.be.ok;
          $('#closeModal').click();
          expect(ui.modal).to.not.be.ok;
        });

        it("toggles FeatureDetails");
        it("toggles fullscreen");
      });

      it('has some feature tabs', function(){
        expect($('.featureTab').length).to.be.above(0);
      });
    });

  });

  if (window.mochaPhantomJS) { mochaPhantomJS.run(); }
  else { mocha.run(); }
});
