var mongoose = require('mongoose'),
  _ = require('lodash'),
  async = require('async');

var Article = mongoose.model('Article');
var User = mongoose.model('User');
module.exports = {
  render: function (req, res, next) {
    var queryParam = req.query.search;

    if (!queryParam || !queryParam.split('-')[0]) {
      res.render('article.pug', {
        data: {
          found: false
        }
      });
    } else {
      var articleTitle = queryParam.split('-')[0].trim();

      async.parallel([
        function (cb) {
          Article.findOne({
            title: articleTitle
          }, cb);
        },
        function (cb) {
          Article.aggregate([{
              $match: {
                title: articleTitle
              }
            },
            {
              $group: {
                _id: "$title",
                count: {
                  $sum: 1
                }
              }
            }
          ], cb);
        },
        function (cb) {
          User.distinct('name', function (err, registeredUsers) {
            if (err) {
              cb(err);
            } else {
              // To find the regular users
              // Find the users of this article
              // who are not anonymous and who dont
              // belong to the users already in database
              Article.aggregate([{
                  $match: {
                    title: articleTitle,
                    anon: {
                      $exists: false
                    },
                    users: {
                      $nin: registeredUsers
                    }
                  }
                },
                {
                  $group: {
                    _id: "$user",
                    count: {
                      $sum: 1
                    }
                  }
                },
                {
                  $sort: {
                    count: -1
                  }
                }
              ], cb);
            }
          });
        }
      ], function (err, results) {
        if (err) {
          next(err);
        } else {
          var article = results[0],
            topEditors = results[2];

          // Only send top 5 editors
          topEditors = topEditors.slice(0, 5);

          res.render('article.pug', {
            data: {
              found: !!article,
              article: article,
              revisions: results[1][0].count,
              topEditors: topEditors
            }
          });
        }
      });
    }
  },
  list: function (req, res, next) {
    Article.aggregate([{
      $group: {
        _id: "$title",
        count: {
          $sum: 1
        }
      }
    }], function (err, articles) {
      if (err) {
        next(err);
      } else {
        return res.json({
          articles: articles
        });
      }
    });
  }
};