// Libraries
var express = require('express'),
  path = require('path'),
  bodyParser = require('body-parser'),
  mongoose = require('mongoose'),
  config = require('./config'),
  session = require('express-session');

// Internal to the app
var routes = require('./app/routes');
var seed = require('./seedFile');

// Import all the database models
require('./app/models/Users');

var app = express();

app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(session({
  secret: 'YcU7FIsEjTFJvNqKR7L9DASNyDn04Fvj2epUx2WQ',
  cookie: {
    maxAge: 600000
  },
  proxy: true,
  resave: true,
  saveUninitialized: true
}));

// Connect to database
mongoose.connect('mongodb://localhost/' + config.dbName);

// Configure routes
app.use(routes);

// Save the json files to database
seed();

app.listen(3000, function () {
  console.log('Data analytics app listening on port 3000!')
});