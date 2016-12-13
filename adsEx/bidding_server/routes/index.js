var express = require('express');
var router = express.Router();
var mediciInit = require('../lib/medici');

var medici = mediciInit.init();

router.get('/:num', function(req, res, next) {
  resp = medici.multiply(req.params['num']).toString(10);
  res.json({"*7": resp});
});

module.exports = router;
