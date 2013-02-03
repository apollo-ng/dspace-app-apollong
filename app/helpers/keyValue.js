define(['handlebars'], function(Handlebars) {
// HELPER: #key_value
//
// Usage: {{#keyValue obj}} Key: {{key}} // Value: {{value}} {{/keyValue}}
//
// Iterate over an object, setting 'key' and 'value' for each property in
// the object.
//
// from https://gist.github.com/1371586
 
  function keyValue(obj, options) {
    var buffer = "",
        key;
 
    for (key in obj) {
        if (obj.hasOwnProperty(key)) {
            buffer += options.fn({key: key, value: obj[key]});
        }
    }
 
    return buffer;
  }
  Handlebars.registerHelper('keyValue', keyValue);

  return keyValue;
});






