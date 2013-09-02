define(['ender', './dspace', './config', './views/nicknamePrompt'], function($, DSpace, config, NicknamePromptView) {

  function fadeSplash() {
    $('#splash').fadeOut(1000, function() { $('#splash').hide(); });
  }

  function promptNickname(callback) {
    var prompt = new NicknamePromptView();
    prompt.on('done', callback);
    prompt.render($('#splash .loader'));
  }

  /**
   * BIG BANG!
   */
  $.domReady(function () {
    window.dspace = new DSpace(config);
    window.world = dspace.world;
    if(dspace.world.user.get('nickname')) {
      fadeSplash();
    } else {
      promptNickname(function(nickname) {
        dspace.world.user.set('nickname', nickname);
        dspace.world.user.save();
        fadeSplash();
      });
    }

    dspace.declareHook('load', function(callback) {
      setTimeout(callback, 0, world);
    });
  });

});
