var mongoose = require('mongoose'),
  _ = require('lodash'),
  moment = require('moment'),
  request = require('request'),
  async = require('async');

var Article = mongoose.model('Article');
var User = mongoose.model('User');
module.exports = {
  article: function (req, res, next) {
    var mediaWikiAPI = 'https://en.wikipedia.org/w/api.php?action=query&prop=revisions&rvprop=flags|ids|size|user|timestamp|sha1|parsedcomment&format=json&titles=';
    var articleTitle = req.params.article;
    var mediaWikiRevisions = [];

    async.series([
      function (cb) {
        async.waterfall([
          function (callback) {
            Article.findOne({
              title: articleTitle
            }, {}, {
              sort: {
                timestamp: -1
              }
            }, callback);
          },
          function (article, callback) {
            if (!article || !article.timestamp) {
              return callback();
            }

            var timePassedSinceLastUpdate = moment().diff(moment(article.timestamp), 'days');
            if (timePassedSinceLastUpdate <= 1) {
              callback(null, article);
            } else {
              request({
                url: mediaWikiAPI + articleTitle,
                headers: {
                  'User-Agent': 'request'
                }
              }, function (err, response, body) {
                if (err) {
                  callback(err);
                } else {
                  var mediaWikiResults = JSON.parse(body);
                  var mediaWikiResponseValues = _.values(mediaWikiResults.query.pages);
                  if (mediaWikiResponseValues.length > 0) {
                    mediaWikiRevisions = mediaWikiResponseValues[0].revisions;
                    // Save only if the revisions are available
                    if (mediaWikiRevisions && mediaWikiRevisions.length > 0) {
                      async.each(mediaWikiRevisions, function (revision, next) {
                        revision.title = articleTitle;
                        next();
                      }, function () {
                        mediaWikiRevisions = _.filter(mediaWikiRevisions, function (revision) {
                          return moment(revision.timestamp).isAfter(moment(article.timestamp));
                        });
                        // Save mediWikiRevisions to db
                        Article.insertMany(mediaWikiRevisions, function (err, data) {
                          if (err) {
                            callback(err);
                          } else {
                            callback(null, article);
                          }
                        });
                      });
                    } else {
                      callback(null, article);
                    }
                  } else {
                    callback(null, article);
                  }
                }

              });
            }
          }
        ], function (err, article) {
          if (err) {
            cb(err);
          } else {
            cb(null, article);
          }
        });
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


        if (!!article) {
          res.json({
            found: true,
            article: article,
            revisions: results[1][0].count,
            topEditors: topEditors,
            newRevisions: mediaWikiRevisions && mediaWikiRevisions.length ? mediaWikiRevisions.length : 0
          });
        } else {
          res.json({
            found: false,
            topEditors: []
          });
        }
      }
    });

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