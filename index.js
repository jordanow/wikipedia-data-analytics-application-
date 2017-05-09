var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var session = require('express-session');

var routes = require('./app/routes');

var app = express();

app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use(session({
  secret: 'YcU7FIsEjTFJvNqKR7L9DASNyDn04Fvj2epUx2WQ',
  cookie: {
    maxAge: 600000
  },
  proxy: true,
  resave: true,
  saveUninitialized: true
}));

app.use(routes);

app.listen(3000, function () {
  console.log('Data analytics app listening on port 3000!')
});