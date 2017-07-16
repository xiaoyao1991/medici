var express = require('express');
var router = express.Router();
var mediciUtils = require('medici-js');

var BID = 1;
var FOLD = -1;

var ASSETS = {
  "nike": '<img src="https://www.nike.com/android-icon-128x128.png"/>',
  "adidas": '<img src="http://www.adidas.com/dwstatic/aaqx_prd/on/demandware.static/Sites-adidas-US-Site/-/default/dw721d387e/images/favicons/favicon.png"/>'
}

var sk = process.env.SK;
var pk = process.env.PK;
var brand = process.env.BRAND;

router.post('/', function(req, res, next) {
  var publisher = req.body.publisherPk;
  var eventId = req.body.eventId;

  // sign a micropayment signature and send
  var amt = Math.random() * 10 + 1;
  var ad = ASSETS[brand];
  var currentBlockId = mediciUtils.getCurrentBlock();
  var sig = mediciUtils.sign(sk, [publisher, eventId, currentBlockId, ad, amt]);

  var resp = {
    "resp": BID,
    "sender": pk,
    "receiver": publisher,
    "eventId": eventId,
    "amt": amt,
    "ad": ad,
    "currentBlockId": currentBlockId,
    "sig": sig
  };

  console.log(resp);
  return res.json(resp);
});

module.exports = router;
