var shell = require('shelljs');

console.log ('remove old ***TEMPORARY*** build dir');
shell.rm('-rf', 'build');

console.log('creating ***TEMPORARY*** build dir');
shell.mkdir('build');

console.log('copying dev data');
shell.cp('test/*', 'build/');

console.log('copying design');
shell.cp('-rf', 'design/*', 'build/');

console.log('copying pkgs');
shell.cp('-rf', 'pkgs', 'build/');

console.log('copying app');
shell.cp('-rf', 'app/*', 'build/');

console.log('building ender');
shell.exec('./node_modules/.bin/ender build -o build/js/ender.js');

process.on('SIGINT', function() {

  console.log ('remove ***TEMPORARY*** build dir');
  shell.rm('-rf', 'build');

  console.log("Exiting...");
            process.exit();

});


/*
 * Watch files for changes
 */
var watch = require('node-watch');
var exec = require('child_process').exec;
var path = require('path');


// changes to app
watch('./app', function(filename) {
  if( filename.match(/\/\./, '')) { 
    console.log('lock file '+ filename);
    return; }
  console.log(filename);
  exec("cp -rf app/* build");
});

// changes to app
watch('./design', function(filename) {
  if( filename.match(/\/\./, '')) { 
    console.log('lock file '+ filename);
    return; }
  console.log(filename);
  shell.cp('-rf', 'design/*', 'build/');
});

//FIXME change to test/fixtures
watch('./test', function(filename) {
  if( filename.match(/\/\./, '')) {
    console.log('lock file '+ filename);
    return; }
  console.log(filename);
  shell.cp( '-f', 'test/*', 'build/');
});

/**Static file server for serving data and UI
 *
 */
var http = require("http"),
url = require("url"),
path = require("path"),
fs = require("fs");
port = process.argv[2] || 3333;


http.createServer(function(request, response) {

  var uri = url.parse(request.url).pathname
  , filename = path.join(process.cwd(), 'build', uri);
  fs.exists(filename, function(exists) {
    if(!exists) {
      response.writeHead(404, {"Content-Type": "text/plain"});
      response.write("404 Not Found\n");
      response.end();
      return;

    }

    if (fs.statSync(filename).isDirectory()) filename += '/index.html';

    fs.readFile(filename, "binary", function(err, file) {

      if(err) {

        response.writeHead(500, {"Content-Type": "text/plain"});
        response.write(err + "\n");
        response.end();

        return;
      }

      // set MIME
      var filetype = filename.split( '.' ).slice( -1 );
      if( filetype == 'js' ) {
        response.setHeader( 'Content-Type',  'text/javascript' ); }
      else if( filetype == 'css' ) {
        response.setHeader( 'Content-Type',  'text/css' ); }

      // set CORS
      response.setHeader('Access-Control-Allow-Origin',  "*");
      response.setHeader('Access-Control-Allow-Headers',  "X-Requested-With");
      response.writeHead(200);
      response.write(file, "binary");
      response.end();

    });

  });

}).listen(parseInt(port, 10));

console.log("Static file server running at\n => http://localhost:" + port + "/\nCTRL + C to shutdown");
