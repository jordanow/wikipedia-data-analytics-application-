var express = require('express');
var router = express.Router();

var homeController = require('../controllers/home'),
  articleController = require('../controllers/articles'),
  chartController = require('../controllers/chart');

router.get('/', homeController);
router.get('/charts/pie', chartController.pie);
router.get('/charts/bar', chartController.bar);
router.get('/articles/list', articleController.list);
module.exports = router;