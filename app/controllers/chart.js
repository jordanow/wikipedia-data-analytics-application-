var mongoose = require('mongoose'),
  _ = require('lodash'),
  async = require('async');

var Article = mongoose.model('Article'),
  User = mongoose.model('User');

module.exports = {
  pie: function (req, res, next) {

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

  bar: function (req, res, next) {
    var finalData = {};

    async.parallel([
        function (cb) {
          // Get all the years when the articles were edited
          Article.aggregate([{
            $project: {
              year: {
                $year: "$timestamp"
              }
            }
          }, {
            $group: {
              _id: null,
              years: {
                $addToSet: "$year"
              }
            }
          }], function (err, result) {
            if (err) {
              cb(err);
            } else {
              cb(null, result[0].years);
            }
          });
        },
        function (cb) {
          // Group by all the articles edited by anons
          Article.aggregate([{
              $match: {
                anon: {
                  $exists: true
                }
              }
            }, {
              $project: {
                year: {
                  $year: "$timestamp"
                },
                user: "$user",
                anon: "$anon"
              }
            },
            {
              $group: {
                _id: "$year",
                users: {
                  $addToSet: "$user"
                }
              }
            },
            {
              $project: {
                year: "$_id",
                anons: {
                  $size: "$users"
                }
              }
            }
          ], function (err, result) {
            if (err) {
              cb(err);
            } else {
              result.forEach(function (res) {
                if (!finalData[res.year]) {
                  finalData[res.year] = [];
                }

                finalData[res.year].push({
                  anons: res.anons
                });
              });
              cb(null, finalData);
            }
          });
        },
        function (cb) {
          // Group by all the articles edited by users
          Article.aggregate([{
              $match: {
                anon: {
                  $exists: false
                }
              }
            }, {
              $project: {
                year: {
                  $year: "$timestamp"
                },
                user: "$user"
              }
            },
            {
              $group: {
                _id: "$year",
                users: {
                  $addToSet: "$user"
                }
              }
            },
            {
              $project: {
                year: "$_id",
                users: {
                  $size: "$users"
                }
              }
            }
          ], function (err, result) {
            if (err) {
              cb(err);
            } else {
              result.forEach(function (res) {
                if (!finalData[res.year]) {
                  finalData[res.year] = [];
                }

                finalData[res.year].push({
                  users: res.users
                });
              });
              cb(null, finalData);
            }
          });
        },
        function (cb) {
          // Find all articles edited by all known users
          User.aggregate([{
            $group: {
              _id: null,
              users: {
                $push: "$name"
              }
            }
          }], function (err, knownUsers) {
            if (err) {
              cb(err);
            } else {
              getUserYearCount(knownUsers[0].users, function (err, data) {
                if (err) {
                  cb(err);
                } else {
                  async.each(data, function (d, next) {
                    if (!finalData[d.year]) {
                      finalData[d.year] = [];
                    }
                    finalData[d.year].push({
                      allUsers: d.users
                    });
                    next();
                  }, cb);
                }
              });
            }
          });
        },
        function (cb) {
          // Find all articles edited by admins
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
          }], function (err, admins) {
            if (err) {
              cb(err);
            } else {
              getUserYearCount(admins[0].users, function (err, data) {
                if (err) {
                  cb(err);
                } else {
                  async.each(data, function (d, next) {
                    if (!finalData[d.year]) {
                      finalData[d.year] = [];
                    }
                    finalData[d.year].push({
                      admins: d.users
                    });
                    next();
                  }, cb);
                }
              });
            }
          });
        },
        function (cb) {
          // Find all articles edited by bots
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
          }], function (err, bots) {
            if (err) {
              cb(err);
            } else {
              getUserYearCount(bots[0].users, function (err, data) {
                if (err) {
                  cb(err);
                } else {
                  async.each(data, function (d, next) {
                    if (!finalData[d.year]) {
                      finalData[d.year] = [];
                    }
                    finalData[d.year].push({
                      bots: d.users
                    });
                    next();
                  }, cb);
                }
              });
            }
          });
        }
      ],
      function (err, results) {
        console.log(results);
        if (err) {
          next(err);
        } else {
          var chartData = [
            // ['Year', 'Anonymous','Administrator', 'Bot', 'Regular User']
            ['Year', 'Anonymous', 'Administrator']
          ];
          _.keys(finalData).forEach(function (key) {
            chartData.push([
              key, finalData[key][0].anons, finalData[key][1].users
            ]);
          });

          return res.json(chartData);
          // [
          //   ['Year', 'Administrator', 'Anonymous', 'Bot', 'Regular User'],
          //   ['2014', 1000, 400, 200, 240],
          //   ['2015', 1170, 460, 250, 230],
          //   ['2016', 660, 1120, 300, 400],
          //   ['2017', 1030, 540, 350, 300]
          // ]
        }
      });
  }
};

var getUserYearCount = function (users, cb) {
  Article.aggregate([{
      $match: {
        user: {
          $in: users
        }
      }
    }, {
      $project: {
        year: {
          $year: "$timestamp"
        },
        user: "$user",
        anon: "$anon"
      }
    },
    {
      $group: {
        _id: "$year",
        users: {
          $addToSet: "$user"
        }
      }
    },
    {
      $project: {
        year: "$_id",
        users: {
          $size: "$users"
        }
      }
    }
  ], function (err, data) {
    if (err) {
      cb(err);
    } else {
      cb(null, data);
    }
  });
};