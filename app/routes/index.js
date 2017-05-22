var express = require('express');
var router = express.Router();

var homeController = require('../controllers/home'),
  articleController = require('../controllers/articles'),
  chartController = require('../controllers/chart');

// api
router.get('/api/articles/list', articleController.list);
router.get('/api/articles/:article', articleController.article);
router.get('/api/charts/article/bar1/:article', chartController.articleBar1);
router.get('/api/charts/article/bar2/:article', chartController.articleBar2);
router.get('/api/charts/article/pie/:article', chartController.articlePie);
router.get('/api/charts/home/bar', chartController.homeBar);
router.get('/api/charts/home/pie', chartController.homePie);
router.get('/api/home/statistics', homeController.statistics);


// Pages
router.get('/*', homeController.render);

module.exports = router;