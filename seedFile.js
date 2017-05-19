// Libraries
var mongoose = require('mongoose'),
  readline = require('readline'),
  fs = require('fs'),
  async = require('async');

// Seed/JSON files
var adminUserFile = './data/admins.txt',
  botUserFile = './data/bots.txt';

// global config
var config = require('./config');

// Gets the count for the given model
var getCount = function (Model, query, cb) {
  Model.count(query, cb);
};

// Read file line by line
var readFile = function (fileName) {
  return readline.createInterface({
    input: fs.createReadStream(fileName),
    terminal: false
  });
};

/**
 * Check for users
 * If the users exist, exit the process
 * If the user database is empty, save all the users in database
 */
var seedUsers = function (cb) {
  // Database models
  var User = mongoose.model('User');

  getCount(User, {
    bot: false
  }, function (err, count) {
    if (err) {
      cb(err);
    } else {
      if (count > 0) {
        cb();
      } else {
        readFile(adminUserFile).on('line', function (user) {
          User.create({
            name: user
          });
        }).on('close', cb);
      }
    }
  });
};

/**
 * Check for bots
 * If the bots exist, exit the process
 * If the user database is empty, save all the bots in database
 */
var seedBots = function (cb) {
  // Database models
  var User = mongoose.model('User');

  getCount(User, {
    bot: true
  }, function (err, count) {
    if (err) {
      cb(err);
    } else {
      if (count > 0) {
        cb();
      } else {
        readFile(botUserFile)
          .on('line', function (user) {
            User.create({
              name: user
            });
          }).on('close', cb);
      }
    }
  });
};

// remove all users from database
var cleanUsers = function (cb) {
  var User = mongoose.model('User');
  User.remove(cb);
};

module.exports = function () {

  async.series([
    cleanUsers,
    seedUsers,
    seedBots
  ], function (err, results) {
    console.log(err, results);
  });
};