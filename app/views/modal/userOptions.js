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
        'change input': 'updateUser',
        'click section > h2 > a': 'setCurrentSection'
      },

      initialize: function(options) {
        this.user = options.user;
        this.aether = options.aether;
        this.$el.html(this.template());

        // deferred, because setting 'checked' attribute will only works
        // after inputs have been rendered.
        var attrs = this.user.toJSON();
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

        // update section size, when window size changes.
        $(window).on('resize', this.updateSectionHeight.bind(this));
      },

      /**
       * Method: updateUser
       *
       * Updates a single attribute of the associated <User> from a
       * a 'change' event.
       * Saves the user.
       *
       * Parameters:
       *   event - a DOM event, with the changed input as 'target'
       */
      updateUser: function(event) {
        var target = this.$(event.target);
        this.user.set(target.attr('name'), target.val());
        this.user.save();
      },

      /**
       * Method: setCurrentSection
       *
       * Collapses all sections, but the one the user clicked.
       */
      setCurrentSection: function(event) {
        var section = $(event.target).closest('section');
        this.$('section.active').removeClass('active').attr('style', '');
        section.addClass('active');
        this.updateSectionHeight();
      },

      /**
       * Method: updateSectionHeight
       *
       * Adjusted the height of the currently opened section.
       *
       * This is needed, so the accordion always fills the whole modal space.
       *
       * Usually happens in response to a section change (<setCurrentSection>),
       * or a 'resize' event from the window.
       *
       */
      updateSectionHeight: function() {
        var sectionCount = this.$('section').length;
        var height = window.innerHeight - (((sectionCount-1) * 50) + (2 * 49));
        this.$('section.active').attr('style', 'height:' + height + 'px');
      }

    });

});
