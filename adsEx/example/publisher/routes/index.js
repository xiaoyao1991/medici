var express = require('express');
var router = express.Router();

var utils = require('ethereumjs-util');
var mediciUtils = require('medici-js');
var request = require('superagent');

var sk = process.env.SK;
var pk = process.env.PK;
var BIDDING_SERVER = "http://localhost:3000/medici/ask";

var unclaimedTokens = [];

router.post('/', function(req, res, next) {
  var eventId = utils.stripHexPrefix(utils.bufferToHex(utils.sha3(pk + Date.now())));
  var sig = mediciUtils.sign(sk, [eventId]);
  request
    .post(BIDDING_SERVER)
    .send({
      "pk": pk,
      "eventId": eventId,
      "sig": sig
    }).then(function(resp, err){
      unclaimedTokens.push(resp.body);
      return res.json({
        "ad": resp.body.ad
      });
    });
});

router.get("/tokens", function(req, res, next) {
  var tokens = unclaimedTokens;
  unclaimedTokens = [];

  return res.json(tokens);
});

module.exports = router;
