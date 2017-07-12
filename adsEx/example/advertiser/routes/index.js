var express = require('express');
var router = express.Router();
var mediciUtils = require('../lib/medici');
var crypto = require('../lib/crypto');

var contract_src = process.env.CONTRACT;
var deployedAt = process.env.DEPLOYEDAT;
var medici = mediciUtils.init(contract_src, deployedAt);

var biddingExpectation = {};
var bidIds = {};

var BID = 1;
var FOLD = -1;

var ads = {
  "nike": '<img src="http://modernmediamix.com/wp-content/uploads/2013/04/NIKE.jpg"/>',
  "adidas": '<img src="https://pbs.twimg.com/profile_images/734704098390462464/Ufr0bXrH.jpg"/>'
}

var sk = process.env.SK;
var pk = process.env.PK;
var brand = process.env.BRAND;

router.post('/', function(req, res, next) {
  var publisher = req.body.publisherPk;
  var eventId = req.body.eventId;
  var currentBid = req.body.currentBid;

  if (!biddingExpectation.hasOwnProperty(publisher + "|" + eventId)) {
    biddingExpectation[publisher + "|" + eventId] = Math.random() * 10 + 1;
    bidIds[publisher + "|" + eventId] = 0;
  }
  var maxExpectedBid = biddingExpectation[publisher + "|" + eventId];

  if (maxExpectedBid <= currentBid) {
    return res.json({"resp": FOLD});
  }

  // sign a micropayment signature and send
  var bidId = bidIds[publisher + "|" + eventId]++;
  var amt = currentBid + 1;
  var ad = ads[brand];
  var currentBlockId = mediciUtils.getCurrentBlock();
  var sig = crypto.sign(sk, [publisher, eventId, currentBlockId, bidId, ad, amt]);

  var resp = {
    "resp": BID,
    "receiver": publisher,
    "eventId": eventId,
    "bidId": bidId,
    "amt": amt,
    "ad": ad,
    "currentBlockId": currentBlockId,
    "sig": sig
  };

  console.log(resp);
  return res.json(resp);
});

module.exports = router;
