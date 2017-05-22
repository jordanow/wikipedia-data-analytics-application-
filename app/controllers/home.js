var mongoose = require('mongoose'),
  _ = require('lodash'),
  path = require('path'),
  async = require('async');

var Article = mongoose.model('Article');
var User = mongoose.model('User');

module.exports = {
  render: function (req, res) {
    res.sendFile('index.html', {
      root: path.join(__dirname, '../../public/views')
    });
  },
  data: function (req, res, next) {
    async.parallel([
        aggregateRevisions,
        aggregateRevisedArticlesByUniqueUsers,
        getArticleRevisionAge
      ],
      function (err, results) {
        if (err) {
          next(err);
        }
        res.render('home.pug', {
          data: {
            revisions: results[0],
            uniqueRevisions: results[1],
            history: results[2]
          }
        });
      });
  }
};

var getArticleRevisionAge = function (cb) {
  async.waterfall([
    function (next) {
      // Get all article names
      Article.distinct('title', next);
    },
    function (articles, next) {
      async.map(articles, function (articleTitle, callback) {
        Article.aggregate([{
            $match: {
              title: articleTitle
            }
          },
          {
            $group: {
              _id: "$title",
              revisions: {
                $push: "$timestamp"
              }
            }
          },
          {
            $unwind: "$revisions"
          },
          {
            $sort: {
              revisions: -1
            }
          },
          {
            $group: {
              _id: "$_id",
              createdAt: {
                $last: "$revisions"
              },
              lastModifiedDate: {
                $first: "$revisions"
              }
            }
          },
          {
            $project: {
              createdAt: "$createdAt",
              lastModifiedDate: "$lastModifiedDate",
              age: {
                $subtract: [new Date(), "$createdAt"]
              }
            }
          }
        ], function (err, results) {
          if (err) {
            callback(err);
          } else {
            callback(null, results[0]);
          }
        });
      }, next);
    }
  ], function (err, articles) {
    if (err) {
      cb(err);
    } else {
      // Now we have all the articles and their ages
      var articlesSortedByAge = _.sortBy(articles, function (article) {
        return article.age;
      });

      cb(null, {
        longest: articlesSortedByAge[articlesSortedByAge.length - 1],
        shortest: articlesSortedByAge[0]
      });
    }
  });
};

var aggregateRevisions = function (cb) {
  // Aggregates the articles and gets a count of each article
  // This count gives us the number of times this article was edited
  // We also sort these articles based on count
  // As a result the first article in the array is the most edited one
  // The last article in the array is least edited
  Article.aggregate([{
    $group: {
      _id: "$title",
      count: {
        $sum: 1
      }
    }
  }, {
    $sort: {
      count: -1
    }
  }], function (err, data) {
    if (err) {
      cb(err);
    } else {
      cb(null, {
        most: data[0],
        least: data[data.length - 1]
      });
    }
  });
};

// It only returns registered users which excludes bots and admins
var aggregateRevisedArticlesByUniqueUsers = function (cb) {
  User.distinct('name', function (err, botsAndAdmins) {
    if (err) {
      cb(err);
    } else {
      Article.aggregate([{
          $match: {
            user: {
              $nin: botsAndAdmins
            }
          }
        },
        {
          $group: {
            _id: "$title",
            users: {
              $addToSet: "$user"
            }
          }
        }, {
          $unwind: "$users"
        },
        {
          $group: {
            _id: "$_id",
            count: {
              $sum: 1
            }
          }
        }, {
          $sort: {
            count: -1
          }
        }
      ], function (err, data) {
        if (err) {
          cb(err);
        } else {
          cb(null, {
            most: data[0],
            least: data[data.length - 1]
          });
        }
      });
    }
  });
};