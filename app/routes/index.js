var express = require('express');
var router = express.Router();

var homeController = require('../controllers/home'),
  articleController = require('../controllers/articles'),
  chartController = require('../controllers/chart');

// api
router.get('/api/charts/pie', chartController.pie);
router.get('/api/charts/bar', chartController.bar);
router.get('/api/articles/list', articleController.list);

// Pages
router.get('/', homeController);
router.get('/article', articleController.render);

module.exports = router;