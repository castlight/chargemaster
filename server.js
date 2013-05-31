#!/usr/bin/env node

var express = require('express'),
    fs = require('fs')
;

var app = express();

app.use(express.cookieParser());
app.use(express.bodyParser());
app.use(express.logger());

// serve main site assets
app.use('/data/', express.static(__dirname + "/data"));

// send root page to app file or login
app.get('/', function(req, res) {
  res.sendfile(docroot + "/index.html");
});

app.listen(5000);

console.log("Listening on port 5000");

