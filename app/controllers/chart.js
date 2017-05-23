var mongoose = require('mongoose'),
  _ = require('lodash'),
  async = require('async');

var Article = mongoose.model('Article'),
  User = mongoose.model('User');

module.exports = {
  articlePie: function (req, res, next) {
    var articleTitle = req.params.article;
    async.parallel([
        function (cb) {
          // Find the number of anonymous editors
          // for this article
          Article.count({
            anon: {
              $exists: true
            },
            title: articleTitle
          }, cb);
        },
        function (cb) {
          // Find the number of non anonymous editors
          // for this article
          Article.count({
            anon: {
              $exists: false
            },
            title: articleTitle
          }, cb);
        },
        function (cb) {
          // Find the bots who edited this article
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
                  },
                  title: articleTitle
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
          // 3. Count how many times bots and admins edited the article
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
                  },
                  title: articleTitle
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
  articleBar1: function (req, res, next) {
    var articleTitle = req.params.article;

    async.parallel([
      function (cb) {
        // Get all the admins who edited this article
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
            var botUsers = bots.length > 0 ? bots[0].users : null;
            if (botUsers) {
              groupUsersByYear(botUsers, articleTitle, cb);
            } else {
              cb(null, []);
            }
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
            var adminUsers = admins.length > 0 ? admins[0].users : null;
            if (adminUsers) {
              groupUsersByYear(adminUsers, articleTitle, cb);
            } else {
              cb(null, []);
            }
          });
      },
      function (cb) {
        // Get all users who edited this article
        Article.aggregate([{
            $match: {
              title: articleTitle
            }
          }, {
            $group: {
              _id: null,
              users: {
                $push: "$user"
              }
            }
          }],
          function (err, all) {
            var allUsers = all.length > 0 ? all[0].users : null;
            if (allUsers) {
              groupUsersByYear(allUsers, articleTitle, cb);
            } else {
              cb(null, []);
            }
          });
      },
      function (cb) {
        // Get all anon users who edited this article
        Article.aggregate([{
            $match: {
              anon: {
                $exists: true
              },
              title: articleTitle
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
            var anonUsers = anons.length > 0 ? anons[0].users : null;
            if (anonUsers) {
              groupUsersByYear(anonUsers, articleTitle, cb);
            } else {
              cb(null, []);
            }
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
  },
  articleBar2: function (req, res, next) {
    var articleTitle = req.params.article;
    var users = [];

    if (req.body.users && req.body.users.length > 0) {
      users = req.body.users;
    }

    var chartData = [];
    var chartDataHeader = ['Year'];

    var finalData = {};

    async.eachSeries(users, function (user, cb) {
      groupUsersByYear([user], articleTitle, function (err, results) {
        if (err) {
          cb(err);
        }
        results = _.sortBy(results, function (result) {
          return result._id;
        });
        chartDataHeader.push(user);
        pushToObj(finalData, results, user);
        cb();
      });
    }, function () {

      _.each(_.keys(finalData), function (year) {
        _.each(users, function (user) {
          if (!finalData[year][user]) {
            finalData[year][user] = 0;
          }
        });
      });

      _.each(_.keys(finalData), function (year) {
        var data = [year];

        _.each(_.keys(finalData[year]), function (user) {
          var indexOfUser = _.indexOf(chartDataHeader, user);
          data[indexOfUser] = (finalData[year][user]);
        });

        chartData.push(data);
      });

      chartData.unshift(chartDataHeader);
      return res.json({
        chartData: chartData
      });
    });
  },
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
            groupUsersByYear(bots[0].users, null, cb);
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
            groupUsersByYear(admins[0].users, null, cb);
          });
      },
      function (cb) {
        // Get all users who edited the articles
        Article.aggregate([{
            $group: {
              _id: null,
              users: {
                $push: "$user"
              }
            }
          }],
          function (err, allUsers) {
            groupUsersByYear(allUsers[0].users, null, cb);
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
            groupUsersByYear(anons[0].users, null, cb);
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

var groupUsersByYear = function (editors, articleTitle, cb) {
  var matchQuery = {
    user: {
      $in: editors
    }
  };

  if (articleTitle) {
    matchQuery.title = articleTitle;
  }

  var query = [{
    $match: matchQuery
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
  }];

  Article.aggregate(query, cb);
};