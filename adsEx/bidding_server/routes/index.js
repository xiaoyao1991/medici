var express = require('express');
var router = express.Router();
var mediciInit = require('../lib/medici');
var crypto = require('../lib/crypto');

var medici = mediciInit.init();

router.get('/:num', function(req, res, next) {
  resp = medici.multiply(req.params['num']).toString(10);
  res.json({"*7": resp});
});

router.post('/ask/', function(req, res, next) {
  var publisherPk = req.body.pk;
  var eventId = req.body.eventId;

  // verify this publisher is known
  console.log(medici.isPublisherExist(publisherPk));
  if (!medici.isPublisherExist(publisherPk)) {
    res.sendStatus(401);
  }
  // get the list of advertisers
  console.log(medici.findAvailableAdvertiserByPublisher(publisherPk));

  // start polling advertisers, with biddingId
    // Who is the publisher
    // What is the eventId
    // Current price


    // Receiver’s public key
    // Current block ID(as timestamp), validate it
    // bid id
    // Amount
    // The actual ads

  // send the winning bid to publisher
});

module.exports = router;
