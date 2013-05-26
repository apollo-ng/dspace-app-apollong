
define(['./searchbox'], function(Searchbox) {

  dspace.plugin('search', {
    name: 'Search',
    description: "Adds a searchbox to the WidgetBar. Searches using OSM nominatim.",
    version: '0.1',
    authors: ['Niklas E. Cathor <nilclass@riseup.net>'],

    hooks: {

      style: 'plugins/search/assets/style.css',

      widgetBarElement: new Searchbox()
    }
  });

});
