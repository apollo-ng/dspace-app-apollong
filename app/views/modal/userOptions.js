define([
  'backbone',
  'views/modal/base',
  'templateMap',
], function(Backbone, BaseModal, templates) {

    /**
     * Class: Modal.UserOptions
     *
     * UI element for Options
     *
     * (see optionsPanel.png)
     */
    return BaseModal.extend({

      template: templates.userOptionModal,

      events: {
        'change input': 'fireChanges'
      },

      initialize: function(options) {
        this.user = options.user;
        this.aether = options.aether;
        var attrs = this.user.toJSON();
        this.$el.html(this.template());

        // deferred, because setting 'checked' attribute will only works
        // after inputs have been rendered.
        setTimeout(function() {
          for(var key in attrs) {
            this.$('input[name="' + key + '"]').forEach(function(input) {
              if(input.type === 'radio') {
                if(input.value === attrs[key]) {
                  this.$(input).attr('checked', true);
                }
              } else {
                this.$(input).val(attrs[key]);
              }
            }.bind(this));
          }
        }.bind(this), 0);
      },

      fireChanges: function(event) {
        var target = this.$(event.target);
        this.user.set(target.attr('name'), target.val());
        this.user.save();
      },

      showFX: function(){
        this.$el.html( this.template( { ui: this.ui } ) );
        this.$el.css( { 'display': 'block'});
        this.$el.fadeIn(350);
      },

      hideFX: function(){
        var self = this;
        this.$el.fadeOut(350, function() { self.$el.hide(); });
      }
    });

});
