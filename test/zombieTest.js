var zombie = require('zombie');
var assert = require('assert');

describe('just checking', function(){
  before(function(done){
    this.browser = new zombie.Browser();
    this.browser.visit('http://localhost:3000/index.dev.html');
  });

  it('says true', function(){
    return true;
  });
});
