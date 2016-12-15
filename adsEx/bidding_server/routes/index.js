var express = require('express');
var router = express.Router();
var mediciUtils = require('../lib/medici');
var crypto = require('../lib/crypto');
var _ = require("lodash");

var Promise = this.Promise || require('promise');
var agent = require('superagent-promise')(require('superagent'), Promise);

var medici = mediciUtils.init();
var BID = 1;
var FOLD = -1;

router.post('/ask/', function(req, res, next) {
  var publisherPk = req.body.pk;
  var eventId = req.body.eventId;

  // verify this publisher is known
  if (!medici.isPublisherExist(publisherPk)) {
    res.sendStatus(401);
  }
  // get the list of advertisers
  var availableAdvertisers = medici.findAvailableAdvertisersByPublisher(publisherPk);
  if (availableAdvertisers.length == 0) {
    res.sendStatus(404);  //no willing bids
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
  if (competitors.length == 0) {
    res.sendStatus(404);
  }

  if (competitors.length == 1) {
    res.json(highestBidResp);
  }

  var promises = [];
  for (var i=0; i<competitors.length; i++) {
    var pk = competitors[i];
    var callback = pkToCallback[pk];
    var promise = agent.post(callback, {
      "publisherPk": publisherPk,
      "eventId": eventId,
      "currentBid": currentBid
    }).end();

    promises.push(promise);
  }

  var newCurrentBid = currentBid;
  var newHighestBidResp = null;

  Promise.all(promises).then(function(values) {
    var newCompetitors = [];
    for (var i=0; i<values.length; i++) {
      var pk = competitors[i];
      if (values[i].resp == FOLD) {
        continue;
      }

      // validate sigs

      newCompetitors.push(pk);
      if (values[i].amt > newCurrentBid) {
        newCurrentBid = values[i].amt;
        newHighestBidResp = values[i];
      }

      pollBids(newCompetitors, pkToCallback, pkToBidIds, newCurrentBid, newHighestBidResp, publisherPk, eventId, res);
    }
  }, function(err) {
      // error occurred
      console.log(err);
  });
}

module.exports = router;
