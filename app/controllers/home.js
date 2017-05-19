var mongoose = require('mongoose'),
  async = require('async');

var Article = mongoose.model('Article');

module.exports = function (req, res, next) {
  async.parallel([
      aggregateRevisions,
      aggregateRevisedArticlesByUniqueUsers
    ],
    function (err, results) {
      if (err) {
        next(err);
      }

      res.render('home.pug', {
        data: {
          revisions: results[0],
          uniqueRevisions: results[1]
        }
      });
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

var aggregateRevisedArticlesByUniqueUsers = function (cb) {
  Article.aggregate([{
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
};