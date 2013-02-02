var zombie = require('zombie');
var assert = require('assert');

describe('just checking', function(){
  before(function(done){
    var browser = new zombie.Browser();
    browser.visit('http://localhost:3000/index.dev.html')
      .then(done, done);
    this.browser = browser;
  });

  it('works', function(){
    assert.equal('DSpace', this.browser.query('head > title').innerHTML);
  });
});
