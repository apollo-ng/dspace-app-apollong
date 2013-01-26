/***
 *
 *  DSpace-Development Assistant
 *
 *  Usage: node run.js [option]
 *  Examples: node run.js 8080 -> Run the Development-Server on port 8080 instead of 3333
 *                   node run.js deploy -> Make only a deploy, keep the build directory and exit
 */


var shell = require('shelljs');

//console.log ('remove old ***TEMPORARY*** build dir');
shell.rm('-rf', 'build');

//console.log('creating ***TEMPORARY*** build dir');
shell.mkdir('-p', 'build/assets');

//console.log('copying dev data');
shell.cp('test/*', 'build/');

console.log('Adding Assets...');
shell.cp('-rf', 'design/css', 'build/assets/');
shell.cp('-rf', 'design/icons', 'build/assets/');
shell.cp('-rf', 'design/images', 'build/assets/');

console.log('Adding 3rd party packages...');
shell.cp('-rf', 'pkgs', 'build/assets/');

console.log('Adding Client-Code...');
shell.cp('-rf', 'app/index.html', 'build/');
shell.cp('-rf', 'app/js/*', 'build/assets/js/');

console.log('Compiling Templates...');
shell.exec('./node_modules/.bin/handlebars design/templates/* -f build/assets/js/templates.js');

console.log('Building Ender...');
shell.exec('./node_modules/.bin/ender build -o build/assets/js/ender.js');


if (process.argv.length > 1 && process.argv[2] == "deploy" ) {
shell.rm('-rf', 'build/test/');
console.log('DSpace-Client build completed');
process.exit(0);
}

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
  shell.cp('-rf', 'app/index.html', 'build/');
  shell.cp('-rf', 'app/js/*', 'build/assets/js/');
});

// changes to design
watch('./design', function(filename) {
  if( filename.match(/\/\./, '')) {
    console.log('lock file '+ filename);
    return; }
  console.log(filename);
  shell.cp('-rf', 'design/css', 'build/assets/');
  shell.cp('-rf', 'design/icons', 'build/assets/');
  shell.cp('-rf', 'design/images', 'build/assets/');
});

// changes to templates
watch('./design/templates', function(filename) {
  if( filename.match(/\/\./, '')) {
    console.log('lock file '+ filename);
    return; }
  console.log(filename);
  console.log('Re-Compiling Templates...');
  shell.exec('./node_modules/.bin/handlebars design/templates/* -f build/assets/js/templates.js');
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

console.log("Development-Server running: http://localhost:" + port + "/\nCTRL+C to shutdown and remove temporary build directory");
