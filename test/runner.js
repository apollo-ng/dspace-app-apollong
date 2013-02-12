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

    it('has some feature tabs', function(){
      expect($('.featureTab').length).to.be.above(0);
    });

    it("watches the geolocation", function() {
      expect(positionCbs.length).to.be.equal(1);
    });

    it("displays the tikiman", function() {
      var tikiman;
      $('img').forEach(function(img) {
        if(img.src.match(/\/assets\/images\/tiki-man.png$/)) {
          tikiman = img;
        }
      });
      expect(tikiman).to.be.ok;
    });

    it("renders MiniMap", function(){
      expect($('#miniMap').length).to.equal(1);
    });

  });

  if (window.mochaPhantomJS) { mochaPhantomJS.run(); }
  else { mocha.run(); }
});
