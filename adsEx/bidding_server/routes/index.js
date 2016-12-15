var express = require('express');
var router = express.Router();
var mediciUtils = require('../lib/medici');
var crypto = require('../lib/crypto');
var _ = require("lodash");
var request = require('superagent');

var medici = mediciUtils.init('/Users/xiaoyaoqian/projects/cs598am/medici/adsEx/contracts/AdExchange.sol');
var BID = 1;
var FOLD = -1;

router.post('/ask/', function(req, res, next) {
  var publisherPk = req.body.pk;
  var eventId = req.body.eventId;

  // verify this publisher is known
  if (!medici.isPublisherExist(publisherPk)) {
    return res.sendStatus(401);
  }
  // get the list of advertisers
  var availableAdvertisers = medici.findAvailableAdvertisersByPublisher(publisherPk);
  if (availableAdvertisers.length == 0) {
    return res.sendStatus(404);  //no willing bids
  }

  var pkToCallback = {};
  var pkToBidIds = {};
  for (var i=0; i<availableAdvertisers.length; i++) {
    var callback = medici.getCallbackByAdvertiser(availableAdvertisers[i]);
    pkToCallback[availableAdvertisers[i]] = callback;
    pkToBidIds[availableAdvertisers[i]] = -1;
  }

  pollBids(availableAdvertisers, pkToCallback, pkToBidIds, 0, null, publisherPk, eventId, res);
});

function pollBids(competitors, pkToCallback, pkToBidIds, currentBid, highestBidResp, publisherPk, eventId, res) {
  console.log("Polling...", competitors);

  if (competitors.length == 0) {
    return res.sendStatus(404);
  }

  if (competitors.length == 1 && highestBidResp != null) {
    highestBidResp['advertiser'] = competitors[0];
    return res.json(highestBidResp);
  }

  var promises = [];
  for (var i=0; i<competitors.length; i++) {
    var pk = competitors[i];
    var callback = pkToCallback[pk];
    var promise = request
      .post(callback)
      .send({
        "publisherPk": publisherPk,
        "eventId": eventId,
        "currentBid": currentBid
      });

    promises.push(promise);
  }

  Promise.all(promises).then(function(values) {
    var newCurrentBid = currentBid;
    var newHighestBidResp = null;
    var newCompetitors = [];
    for (var i=0; i<values.length; i++) {
      var pk = competitors[i];
      if (values[i].body.resp == FOLD) {
        continue;
      }

      // validate sigs

      newCompetitors.push(pk);
      if (values[i].body.amt > newCurrentBid) {
        newCurrentBid = values[i].body.amt;
        newHighestBidResp = values[i].body;
      }

      console.log(values[i].body);
    }
    console.log("new...", newHighestBidResp, newCurrentBid);
    pollBids(newCompetitors, pkToCallback, pkToBidIds, newCurrentBid, newHighestBidResp, publisherPk, eventId, res);
  }, function(err) {
      // error occurred
      console.log(err);
  });
}

module.exports = router;
