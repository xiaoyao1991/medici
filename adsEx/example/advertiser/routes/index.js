var express = require('express');
var router = express.Router();
var mediciUtils = require('../lib/medici');
var crypto = require('../lib/crypto');

var medici = mediciUtils.init('/Users/xiaoyaoqian/projects/cs598am/medici/adEx/contracts/AdExchange.sol');

var biddingExpectation = {};
var bidIds = {};

var BID = 1;
var FOLD = -1;

var sk = process.env.SK;
var pk = process.env.PK;

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
  var currentBlockId = mediciUtils.getCurrentBlock();
  var ad = "img1";
  var sig = crypto.sign(sk, [publisher, bidId, currentBlockId, amt, ad]);

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
