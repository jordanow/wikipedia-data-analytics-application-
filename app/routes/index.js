var express = require('express');
var router = express.Router();

var homeController = require('../controllers/home');

router.get('/', homeController);
module.exports = router;