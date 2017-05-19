// Libraries
var mongoose = require('mongoose'),
  readline = require('readline'),
  fs = require('fs'),
  async = require('async');

// Seed/JSON files
var adminUserFile = './data/admins.txt',
  botUserFile = './data/bots.txt',
  revisionsDir = './data/revisions';

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
              name: user,
              bot: true
            });
          }).on('close', cb);
      }
    }
  });
};

// remove all data from model database
var cleanModel = function (model, cb) {
  var Model = mongoose.model(model);
  Model.remove(cb);
};

// Save all this articles using bulk insert
var saveArticles = function (Model, articles, cb) {
  console.log(articles.length);
  Model.insertMany(articles, cb);
};

var seedRevisions = function (cb) {
  var Article = mongoose.model('Article');

  fs.readdir(revisionsDir, function (err, filenames) {
    if (err) {
      cb(err);
    } else {
      async.eachLimit(filenames, 10, function (fileName, next) {
        fs.readFile(revisionsDir + '/' + fileName, 'utf-8', function (err, data) {
          if (err) {
            next(err);
          } else {
            saveArticles(Article, JSON.parse(data), next);
          }
        });
      }, cb);
    }
  });
};

module.exports = function () {
  async.series([
    function (cb) {
      cleanModel('User', cb);
    },
    function (cb) {
      cleanModel('Article', cb);
    },
    seedUsers,
    seedBots,
    seedRevisions
  ], function (err, results) {
    if (err) {
      console.log('Error while saving data to MongoDB', err);
    } else {
      console.log('Run robomongo and check your documents. All data must be in Wikipedia database and users collection should have 1479 entries while articles should be 550084');
    }
  });
};