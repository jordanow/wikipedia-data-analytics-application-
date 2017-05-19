var mongoose = require('mongoose'),
  async = require('async');

module.exports = function (req, res, next) {
  var Article = mongoose.model('Article');

  async.parallel([
      function (cb) {
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
              mostRevisions: data[0],
              leastRevisions: data[data.length - 1]
            });
          }
        });
      }
    ],
    function (err, results) {
      if (err) {
        next(err);
      }
      var revisionResults = results[0];
      console.log(revisionResults);
      console.log(results);
      res.render('home.pug', {
        data: {
          revisions: {
            most: revisionResults.mostRevisions,
            least: revisionResults.leastRevisions
          }
        }
      });
    });
};