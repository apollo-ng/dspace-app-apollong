mocha.setup('bdd');

mocha.globals(['provide', '$', 'ender']);

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
