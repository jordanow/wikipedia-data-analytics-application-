var mongoose = require('mongoose'),
  async = require('async');

var Article = mongoose.model('Article');
module.exports = {
  render: function (req, res, next) {
    res.render('article.pug', {
      data: {
        // revisions: results[0],
        // uniqueRevisions: results[1]
      }
    });
  },
  list: function (req, res, next) {
    Article.distinct('title', function (err, articles) {
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