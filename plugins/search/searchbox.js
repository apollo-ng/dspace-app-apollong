define([
  'ender',
  'backbone',
  'hbs!./templates/searchbox',
  './searchfeed'
], function($, Backbone, SearchboxTemplate, SearchFeed) {

  return Backbone.View.extend({

    tagName: 'div',
    id: 'searchWidget',
    className: 'widgetIcon',

    template: SearchboxTemplate,

    events: {
      'submit #searchForm': 'createSearch'
    },

    render: function() {
      this.$el.html(this.template());
      return this.$el;
    },

    /**
     * Method: createSearch
     *
     */
    createSearch: function(event) {
      event.preventDefault();
      var query = event.target.query.value;
      var searchFeed = new SearchFeed({
        query: query, extent: dspace.ui.map.frame.getExtent()
      });
      var index = dspace.world.addFeed(searchFeed, true);
    }

  });

});
