var express = require('express');
var router = express.Router();

var homeController = require('../controllers/home'),
  chartController = require('../controllers/chart');

router.get('/', homeController);
router.get('/home/charts/pie', chartController.pie);
router.get('/home/charts/bar', chartController.bar);
module.exports = router;