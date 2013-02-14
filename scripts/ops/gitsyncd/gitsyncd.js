#!/usr/bin/env node

var http = require('http'),
    qs   = require('querystring'),
    exec = require('child_process').exec;

var lcid='';

/**
*  SafeExit for anything else than we expect
*/
function safeExit (req, res) {
  res.writeHead(406, 'Not acceptable', {'Content-Type': 'text/html'});
  res.end('<html><head><title>406 - Not acceptable</title></head><body><h1>May the daemon protect us</h1></body></html>');
  req.connection.destroy();
}

function runSh(cmd) {
  var child = exec(cmd, function(err, stdout, stderr) {
    if (err) console.log('WARN: '+err);
  });
}

/**
*  getHookData collects and converst the github post request
*  into a JSON objects and calls gitsync when done
*/
function getHookData(req, res) {
  var data = '';

  req.on('data', function(chunk) {
    data += chunk;
    if(data.length > 25000) {
      data = '';
      safeExit(req, res);
    }
  });

  req.on('end', function() {
    res.writeHead(200, 'OK', {'Content-Type': 'text/html'});
    res.end('<html><head><title>Accepted</title></head><body><h1>Thanks for the ping, may the daemon protect you</h1></body></html>');
    req.connection.destroy();
    var hook = qs.parse(data);
    gitsync(JSON.parse(hook.payload));
    hook = '';
  });
}

/**
*  Call the actual syncing script with branch name as $1
*/
function gitsync(hookdata) {
  if (hookdata.repository.name === 'dspace-client') {
    if (hookdata.ref === 'refs/heads/develop') {
      if (hookdata.head_commit.id != lcid) {
        console.log('INFO: Starting gitsync for develop branch ('+ hookdata.head_commit.id  +')');
        runSh('/bin/bash gitsync.sh develop');
        console.log('INFO: Git sync completed');
        lcid=hookdata.head_commit.id;
      } else {
        console.log('INFO: Nothing to do, already on latest');
      }
    } else if (hookdata.ref === 'refs/heads/master') {
      if (hookdata.head_commit.id != lcid) {
        console.log('INFO: Starting gitsync for master branch ('+ hookdata.head_commit.id  +')');
        runSh('/bin/bash gitsync.sh master');
        console.log('INFO: Git sync completed');
        lcid=hookdata.head_commit.id;
      } else {
        console.log('INFO: Nothing to do, already on latest');
      }
    }
  }
}

function startServer(port, bind) {
  http.createServer(function (req, res) {
    if (
       req.url === '/'
    && req.method === 'POST'
    && req.headers['content-type'] === 'application/x-www-form-urlencoded'
    ) {
      console.log('INFO: Hook request received');
      getHookData(req, res);
    } else {
      console.log('ERROR: Non-acceptable request received')
      safeExit(req, res);
    }
  }).listen(port, bind);
  console.log('gitsyncd running at '+ bind +':'+ port);
}

startServer(9001, '127.0.0.1');

