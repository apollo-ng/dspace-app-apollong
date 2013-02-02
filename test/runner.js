require(["ender"], function($){
  mocha.setup('bdd');

  mocha.globals(['provide', '$', 'ender', '_', 'Backbone']);

  var expect = chai.expect;

  describe('something...', function(){

    before(function(done){
      navigator.geolocation = {};
      navigator.geolocation.watchPosition = function(){
        console.log('WATCH POSITION called');
      };
      setTimeout(function() {
        done();
      }, 8000);
    });

    it('always true', function(){
      expect($('.featureTab').length).to.be.equal(2);
    });

    it('always false', function(){
      expect(false).to.be.true;
    });
  });

  if (window.mochaPhantomJS) { mochaPhantomJS.run(); }
  else { mocha.run(); }
});
