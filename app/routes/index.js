var express = require('express');
var router = express.Router();

var homeController = require('../controllers/home'),
  articleController = require('../controllers/articles'),
  chartController = require('../controllers/chart');

// api
router.get('/api/charts/home/pie', chartController.homePie);
router.get('/api/charts/home/bar', chartController.homeBar);
router.get('/api/charts/article/pie', chartController.articlePie);
router.get('/api/charts/article/bar1', chartController.articleBar1);
router.get('/api/charts/article/bar2', chartController.articleBar2);
router.get('/api/articles/list', articleController.list);
// Pages
router.get('*', homeController.render);
// router.get('/article', articleController.render);

module.exports = router;