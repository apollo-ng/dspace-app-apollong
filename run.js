#!/usr/bin/env node
/***
 *
 *  DSpace-Development Server
 *
 *  Usage: ./run.js [option]
 *  Examples: ./run.js 8080 -> Run the Development-Server on port 8080 instead of 3000
 */

var http = require("http"),
url = require("url"),
path = require("path"),
fs = require("fs");
port = process.argv[2] || 3000;


http.createServer(function(request, response) {

  var uri = url.parse(request.url).pathname
  , filename = path.join(process.cwd(), '.', uri);
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
      else if( filetype == 'svg' ) {
        response.setHeader( 'Content-Type',  'image/svg+xml' ); }

      // set CORS
      response.setHeader('Access-Control-Allow-Origin',  "*");
      response.setHeader('Access-Control-Allow-Headers',  "X-Requested-With");
      response.writeHead(200);
      response.write(file, "binary");
      response.end();

    });

  });

}).listen(parseInt(port, 10));

console.log("DSpace Development-Server running on http://localhost:" + port + "/");
