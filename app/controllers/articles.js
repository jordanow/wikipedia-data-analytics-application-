var mongoose = require('mongoose'),
  _ = require('lodash'),
  async = require('async');

var Article = mongoose.model('Article');
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
        }
      ], function (err, results) {
        if (err) {
          next(err);
        } else {
          var article = results[0];
          res.render('article.pug', {
            data: {
              found: !!article,
              article: article
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