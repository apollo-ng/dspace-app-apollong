define(['handlebars'], function(Handlebars) {

  function truncate(text, max) {
    return text.length > max ? text.slice(0, max) + '...' : text;
  }

  Handlebars.registerHelper('truncate', truncate);

  return truncate;

});