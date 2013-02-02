define(['zombie'], function(zombie) {
  var suites = [];

  suites.push({

    name: 'zombie suite',
    desc: 'a few unsorted zombie tests',

    setup: function(env, test) {
      env.browser = new zombie.Browser();
      env.rootURL = 'http://localhost:3000/index.dev.html';
      test.result(true);
    },

    beforeEach: function(env, test) {
      env.browser.visit(env.rootURL).then(function() {
        test.result(true)
      }, function() {
        test.result(false);
      })
    },

    tests: [

      {
        desc: "Title is correct",
        run: function(env, test) {
          test.assert(env.browser.query('head > title').innerHTML, 'DSpace');
        }
      }

    ]

  });

  return suites;
});

// var zombie = require('zombie');
// var assert = require('assert')
// ;
// describe('just checking', function(){
//   before(function(done){
//     var browser = new zombie.Browser();
//     browser.visit()
//       .then(function() {
//         setTimeout(done, 1000);
//       }, done);
//     this.browser = browser;
//     this.browser.windows._current.navigator.geolocation = {
//       watchPosition: function() {
//         console.log("WATCH POS", arguments);
//       }
//     };
//   });

//   it('title is correct', function(){
//     assert.equal('DSpace', this.browser.query('head > title').innerHTML);
//   });

//   it('map is there', function() {
//     assert.ok(this.browser.query('#map'));
//   });

//   it('featurebox items und so', function() {
//     assert.ok(this.browser.queryAll('.featureBoxItem').length > 0);
//   });

//   it('we have tikiman', function() {
//     assert.ok(this.browser.query('img[src="design/images/tiki-man.png"]'));
//   });
// });
