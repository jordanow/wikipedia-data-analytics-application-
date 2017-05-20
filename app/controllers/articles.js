var mongoose = require('mongoose'),
  async = require('async');

var Article = mongoose.model('Article');
module.exports = {
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