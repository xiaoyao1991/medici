var express = require('express');
var router = express.Router();
var mediciUtils = require('medici-js');

var contractSrc = process.env.CONTRACT;
var deployedAt = process.env.DEPLOYEDAT;
var medici = mediciUtils.init(contractSrc, deployedAt);

var biddingExpectation = {};
var bidIds = {};

var BID = 1;
var FOLD = -1;

var ads = {
  "nike": '<img src="http://modernmediamix.com/wp-content/uploads/2013/04/NIKE.jpg"/>',
  "adidas": '<img src="http://www.adidas.com/dwstatic/aaqx_prd/on/demandware.static/Sites-adidas-US-Site/-/default/dw721d387e/images/favicons/favicon.png"/>'
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
  var sig = mediciUtils.sign(sk, [publisher, eventId, currentBlockId, bidId, ad, amt]);

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
