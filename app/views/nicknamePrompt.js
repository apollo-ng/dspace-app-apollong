define([
  'backbone',
  'hbs!templates/nicknamePrompt'
], function(Backbone, NicknamePromptTemplate) {
  return Backbone.View.extend({

    template: NicknamePromptTemplate,

    initialize: function() {
      this.save = this.save.bind(this);
    },

    render: function(target) {
      target.html(this.template());

      setTimeout(function() {
        target.find('#nickname-prompt').submit(this.save);
      }.bind(this), 0);
    },

    save: function(event) {
      event.preventDefault();
      var nickname = event.target.nickname.value;
      if(nickname) {
        this.trigger('done', nickname);
      }
    }
  });
});
