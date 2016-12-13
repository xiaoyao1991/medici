var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  res.json({"a":"a"});
});

module.exports = router;
