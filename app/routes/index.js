var express = require('express');
var router = express.Router();

var homeController = require('../controllers/home'),
  articleController = require('../controllers/articles'),
  chartController = require('../controllers/chart');

// api
router.get('/api/charts/home/pie', chartController.homePie);
router.get('/api/charts/home/bar', chartController.homeBar);
router.get('/api/articles/list', articleController.list);

// Pages
router.get('/', homeController);
router.get('/article', articleController.render);

module.exports = router;