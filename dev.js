var shell = require('shelljs');

console.log ('remove old ***TEMPORARY*** build dir');
shell.rm('-rf', 'build');

console.log('creating ***TEMPORARY*** build dir');
shell.mkdir('build');

console.log('copying index.html');
shell.cp('app/index.html', 'build/');

console.log('copying dev data');
shell.cp('test/dev-data.js', 'build/');

console.log('copying assets');
shell.cp('-rf', 'assets', 'build/');

console.log('copying pkgs');
shell.cp('-rf', 'pkgs', 'build/');

console.log('building ender');
shell.exec('ender build -o build/assets/js/ender.js');

process.on('SIGINT', function() {

  console.log ('remove ***TEMPORARY*** build dir');
  shell.rm('-rf', 'build');

  console.log("Exiting...");
            process.exit();

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
