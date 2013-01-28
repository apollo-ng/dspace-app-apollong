
var fs = require('fs');

// usage: wrap-define.js <input> <output> <returned-symbol> [<deps>...]

if(process.argv.length < 5) {
  console.error("usage: " + process.argv.slice(0, 2).join(' ') + " <input> <output> <returned-symbol> [<deps>...]");
  process.exit();
}

var inputFile      = process.argv[2];
var outputFile     = process.argv[3];
var returnedSymbol = process.argv[4];
var deps           = process.argv.slice(5);

var output = '';

if(deps.length === 0) {
  output += "define([], function() {\n\n";
} else {
  'define([';
  var paths = [];
  var symbols = [];
  deps.forEach(function(dep) {
    var parts = dep.split(':');
    var path = parts[0];
    var symbol = parts[1];
    if(! symbol) {
      symbol = path.split('/').slice(-1);
    }
    paths.push(path);
    symbols.push(symbol);
  });
  output += "define([\n" + paths.map(function(path) {
    return "  '" + path.replace("'", "\\'") + "'";
  }).join(', \n') + "\n" + "], function(" + symbols.join(', ') + ") {\n\n"
}
output += fs.readFileSync(inputFile, 'utf8');
output += "\n\n  return " + returnedSymbol + ";\n});\n";

fs.writeFileSync(outputFile, output, 'utf8');

console.log("done.");
