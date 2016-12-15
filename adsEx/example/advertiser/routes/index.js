var express = require('express');
var router = express.Router();
var mediciUtils = require('../lib/medici');
var crypto = require('../lib/crypto');

var medici = mediciUtils.init();

var biddingExpectation = {};
var bidIds = {};

var BID = 1;
var FOLD = -1;

var sk = process.env.SK;

router.get('/', function(req, res, next) {
  var publisher = req.body.publisherPk;
  var eventId = req.body.eventId;
  var currentBid = req.body.currentBid;

  if (!biddingExpectation.hasOwnProperty(publisher + "|" + eventId)) {
    biddingExpectation[publisher + "|" + eventId] = Math.random() * 10 + 1;
    bidIds[publisher + "|" + eventId] = 0;
  }
  var maxExpectedBid = biddingExpectation[publisher + "|" + eventId];

  if (maxExpectedBid <= currentBid) {
    res.json({"resp": FOLD});
  }

  // sign a micropayment signature and send
  var bidId = bidIds[publisher + "|" + eventId]++;
  var amt = currentBid + 1;
  var currentBlockId = mediciUtils.getCurrentBlock();
  var ads = "img1";

  var stub = publisher + "|" + bidId + "|" + currentBlockId + "|" + amt + "|" + ads;
  var sig = crypto.sign(sk, stub);

  res.json({
    "resp": BID,
    "receiver": publisher,
    "eventId": eventId,
    "bidId": bidId,
    "amt": amt,
    "ads": ads,
    "currentBlockId": currentBlockId,
    "sig": sig
  });
});

module.exports = router;
