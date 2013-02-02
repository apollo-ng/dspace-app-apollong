var zombie = require('zombie');
var assert = require('assert');

describe('just checking', function(){
  before(function(done){
    this.browser = new zombie.Browser();
    this.browser.visit('http://localhost:3000/index.dev.html')
      .then(done, done)
      .fail(function(){
        console.log('fail');
      });
  });

  it('says true', function(){
    return true;
  });
});
