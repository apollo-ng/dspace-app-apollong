define([
  'ender',
  'backbone',
  'views/modal/base',
  'templateMap',
], function($, Backbone, BaseModal, templates) {

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
        'change input': 'fireChanges',
        'click section > h2 > a': 'setCurrentSection'
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

        $(window).on('resize', this.updateSectionHeight.bind(this));
      },

      fireChanges: function(event) {
        var target = this.$(event.target);
        this.user.set(target.attr('name'), target.val());
        this.user.save();
      },

      setCurrentSection: function(event) {
        var section = $(event.target).closest('section');
        this.$('section.active').removeClass('active').attr('style', '');
        section.addClass('active');
        this.updateSectionHeight();
      },

      updateSectionHeight: function() {
        var sectionCount = this.$('section').length;
        var height = window.innerHeight - (((sectionCount-1) * 50) + (2 * 49));
        this.$('section.active').attr('style', 'height:' + height + 'px');
      }

    });

});
