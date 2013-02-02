mocha.setup('bdd');

function assert(expr, msg) {
  if (!expr) throw new Error(msg || 'failed');
}

describe('something...', function(){

  it('always true', function(){
    assert(true);
  });
});

if (window.mochaPhantomJS) { mochaPhantomJS.run(); }
else { mocha.run(); }
