#!/usr/bin/env node

var express = require('express'),
    fs = require('fs')
;

var app = express();
app.set('view engine', 'ejs');

app.use(express.cookieParser());
app.use(express.bodyParser());
app.use(express.logger());

// serve main site assets
app.use('/data/', express.static(__dirname + "/data"));
app.use('/public/', express.static(__dirname + "/public"));

// send root page to app file or login
app.get('/', function(req, res) {
  var data = require(__dirname + '/data/drgs.json');
  res.render(__dirname + "/index.ejs", { 'data': JSON.stringify(data) });
});

app.get('/detail', function (req, res){
  var q = req.body.q;
  var drg = 1;
  var data = { foo: "baz" };
  res.render(__dirname + "/detail.ejs", { 'drg': drg, 'data': JSON.stringify(data), 'q': q });
});

app.listen(5000);

console.log("Listening on port 5000");

