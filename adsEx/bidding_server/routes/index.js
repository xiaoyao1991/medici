var express = require('express');
var router = express.Router();
var mediciInit = require('../lib/medici');
var crypto = require('../lib/crypto');
var request = require('superagent');
var _ = require("lodash");

var medici = mediciInit.init();
var BID = 1;
var FOLD = -1;

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
  var availableAdvertisers = medici.findAvailableAdvertisersByPublisher(publisherPk);
  console.log(availableAdvertisers);
  if (availableAdvertisers.length == 0) {
    res.sendStatus(404);  //no willing bids
  }

  var pkToCallback = {};
  for (var i=0; i<availableAdvertisers.length; i++) {
    var callback = medici.getCallbackByAdvertiser(availableAdvertisers[i]);
    pkToCallback[availableAdvertisers[i]] = callback;
  }

  var competitors = availableAdvertisers;
  var currentBid = 0;
  while (competitors.length > 1) {
    var nextRoundCompetitors = competitors;
    for (var i=0; i<competitors.length; i++) {
      var pk = competitors[i];
      var callback = pkToCallback[pk];
      request //async call????
        .post(callback)
        .send({
          "publisherPk": publisherPk,
          "eventId": eventId,
          "currentBid": currentBid
        })
        .end(function(err, res){
          if (!err) {
            if (res.resp == BID) {

            } else {
              _.remove(nextRoundCompetitors, function(n) {
                return n == pk;
              });
            }
          }
        });
    }
  }


    // Receiver’s public key
    // Current block ID(as timestamp), validate it
    // bid id
    // Amount
    // The actual ads

  // send the winning bid to publisher
});

module.exports = router;
