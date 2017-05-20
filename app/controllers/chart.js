var mongoose = require('mongoose'),
  _ = require('lodash'),
  async = require('async');

var Article = mongoose.model('Article'),
  User = mongoose.model('User');

// Extracts the article title from the given string
var getArticleTitle = function (query) {
  var articleTitle;
  if (!query || !query.split('-')[0]) {
    articleTitle = null;
  } else {
    articleTitle = query.split('-')[0].trim()
  }
  return articleTitle;
};

module.exports = {
  articlePie: function (req, res, next) {
    var articleTitle = getArticleTitle(req.query.search);
  },
  articleBar1: function (req, res, next) {},
  articleBar2: function (req, res, next) {},
  homePie: function (req, res, next) {

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
          // Find the number of non anonymous editors
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
  },

  homeBar: function (req, res, next) {
    async.parallel([
      function (cb) {
        // Get all the admins who edited the articles
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
          function (err, bots) {
            groupUsersByYear(bots[0].users, cb);
          });
      },
      function (cb) {
        // Get all the bots who edited the articles
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
          function (err, admins) {
            groupUsersByYear(admins[0].users, cb);
          });
      },
      function (cb) {
        // Get all users who edited the articles
        Article.aggregate([{
            $match: {
              anon: {
                $exists: false
              }
            }
          }, {
            $group: {
              _id: null,
              users: {
                $push: "$user"
              }
            }
          }],
          function (err, allUsers) {
            groupUsersByYear(allUsers[0].users, cb);
          });
      },
      function (cb) {
        // Get anonymous users
        Article.aggregate([{
            $match: {
              anon: {
                $exists: true
              }
            }
          }, {
            $group: {
              _id: null,
              users: {
                $push: "$user"
              }
            }
          }],
          function (err, anons) {
            groupUsersByYear(anons[0].users, cb);
          });
      }
    ], function (err, results) {
      if (err) {
        next(err);
      } else {
        var anonsYear = results[3],
          allUsersYear = results[2],
          botsYear = results[1],
          adminsYear = results[0];

        var finalData = {};

        pushToObj(finalData, allUsersYear, 'allUsers');
        pushToObj(finalData, botsYear, 'bots');
        pushToObj(finalData, adminsYear, 'admins');
        pushToObj(finalData, anonsYear, 'anons');

        var chartData = [
          ['Year', 'Anonymous', 'Administrator', 'Bot', 'Regular User']
        ];

        async.each(_.keys(finalData), function (key) {
          var regularUsers = finalData[key].allUsers - finalData[key].anons - finalData[key].admins - finalData[key].bots;
          chartData.push([
            key,
            finalData[key].anons || 0,
            finalData[key].admins || 0,
            finalData[key].bots || 0,
            regularUsers || 0
          ]);
        });

        return res.json({
          chartData: chartData
        });
      }
    });
  }
};

var pushToObj = function (target, src, type) {
  async.each(src, function (key) {
    if (!target[key._id]) {
      target[key._id] = {};
    }
    target[key._id][type] = key.numOfUsers;
  });
};

var groupUsersByYear = function (editors, cb) {
  Article.aggregate([{
    $match: {
      user: {
        $in: editors
      }
    }
  }, {
    $project: {
      year: {
        $year: "$timestamp"
      },
      user: "$user"
    }
  }, {
    $group: {
      _id: "$year",
      users: {
        $push: "$user"
      }
    }
  }, {
    $project: {
      year: "$year",
      numOfUsers: {
        $size: "$users"
      }
    }
  }], cb);
};