var express = require('express');
var router = express.Router();
var mediciUtils = require('medici-js');
var request = require('superagent');
var medici = mediciUtils.init(process.env.CONTRACT, process.env.DEPLOYEDAT);
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
  for (var i=0; i<availableAdvertisers.length; i++) {
    var callback = medici.getCallbackByAdvertiser(availableAdvertisers[i]);
    pkToCallback[availableAdvertisers[i]] = callback;
  }

  pollBids(availableAdvertisers, pkToCallback, publisherPk, eventId, res);
});

function pollBids(competitors, pkToCallback, publisherPk, eventId, res) {
  console.log("Polling...", competitors);
  var promises = [];
  for (var i=0; i<competitors.length; i++) {
    var pk = competitors[i];
    var callback = pkToCallback[pk];
    var promise = request
      .post(callback)
      .send({
        "publisherPk": publisherPk,
        "eventId": eventId
      });

    promises.push(promise);
  }

  Promise.all(promises).then(function(values) {
    var highest = 0;
    var highestResp = null;
    var second = 0;
    for (var i=0; i<values.length; i++) {
      var pk = competitors[i];
      if (values[i].body.resp == FOLD) {
        continue;
      }

      // validate sigs
      var sig = values[i].body.sig;
      var receiver = values[i].body.receiver;
      var eventId = values[i].body.eventId;
      var currentBlockId = values[i].body.currentBlockId;
      var ad = values[i].body.ad;
      var amt = values[i].body.amt;
      var pk = values[i].body.sender;

      if (!mediciUtils.verify(pk, [receiver, eventId, currentBlockId, ad, amt], sig)) {
        console.err("Found bogus signature!");
        continue;
      }

      if (amt > highest) {
        second = highest;
        highest = amt;
        highestResp = values[i].body;
      }

      console.log(values[i].body);
    }
    res.json(highestResp);

  }, function(err) {
      console.log(err);
  });
}

module.exports = router;
