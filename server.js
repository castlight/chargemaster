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
  res.render(__dirname + "/index.ejs", { 'data': data });
});

app.get('/detail', function (req, res){
  var code = parseInt(req.body.id);
  var loc = "San Francisco, CA";
  var data = { foo: "baz" }; // var data = require(__dirname + '/data/???.json');
  res.render(__dirname + "/detail.ejs", { data: 'data' });
});

app.listen(5000);

console.log("Listening on port 5000");

