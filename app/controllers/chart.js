var mongoose = require('mongoose'),
  async = require('async');

var Article = mongoose.model('Article'),
  User = mongoose.model('User');

module.exports = {
  home: function (req, res, next) {

    async.parallel([
        function (cb) {
          // Find the number of anonymous editors
          Article.count({
            anon: {
              $exists: true
            }
          }, cb);
        },
        function (cb) {
          // Find the number of anonymous editors
          Article.count({
            anon: {
              $exists: false
            }
          }, cb);
        },
        function (cb) {
          // Find articles edited by bots
          User.aggregate([{
              $match: {
                bot: true
              }
            }, {
              $group: {
                _id: null,
                users: {
                  $push: "$name"
                }
              }
            }],
            function (err, bots) {
              if (err) {
                cb(err);
              } else {
                Article.count({
                  user: {
                    $in: bots[0].users
                  }
                }, function (err, count) {
                  if (err) {
                    cb(err);
                  } else {
                    cb(null, count);
                  }
                });
              }
            });
        },
        function (cb) {
          // 1. Get all the bots from database
          // 2. Get all the admins from database
          // 3. Count the articles edited by bots and admins

          // Find articles edited by admins
          User.aggregate([{
              $match: {
                bot: false
              }
            }, {
              $group: {
                _id: null,
                users: {
                  $push: "$name"
                }
              }
            }],
            function (err, admins) {
              if (err) {
                cb(err);
              } else {
                Article.count({
                  user: {
                    $in: admins[0].users
                  }
                }, function (err, count) {
                  if (err) {
                    cb(err);
                  } else {
                    cb(null, count);
                  }
                });
              }
            });
        },
      ],
      function (err, results) {
        if (err) {
          next(err);
        } else {
          var articlesEditedByAnons = results[0];
          var articlesEditedByKnownUsers = results[1];

          var articlesEditedByBots = results[2];
          var articlesEditedByAdmins = results[3];

          var articlesEditedByRegulars = articlesEditedByKnownUsers - articlesEditedByBots - articlesEditedByAdmins;
          return res.json([
            ['Bot', articlesEditedByBots],
            ['Anonymous', articlesEditedByAnons],
            ['Administrator', articlesEditedByAdmins],
            ['Regular user', articlesEditedByRegulars]
          ]);
        }
      });
  }
};