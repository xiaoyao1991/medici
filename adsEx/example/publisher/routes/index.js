var express = require('express');
var router = express.Router();

var utils = require('ethereumjs-util');
var mediciUtils = require('../lib/medici');
var crypto = require('../lib/crypto');
var request = require('superagent');

var contract_src = process.env.CONTRACT;
var medici = mediciUtils.init(contract_src);

var sk = process.env.SK;
var pk = process.env.PK;
var BIDDING_SERVER = "http://localhost:3000/medici/ask";

var unclaimedTokens = [];

router.post('/', function(req, res, next) {
  var eventId = utils.bufferToHex(utils.sha3(pk + Date.now()));
  var sig = crypto.sign(sk, eventId);

  request
    .post(BIDDING_SERVER)
    .send({
      "pk": pk,
      "eventId": eventId,
      "sig": sig
    }).then(function(resp, err){
      unclaimedTokens.push(resp);
      return res.json({
        "ad": resp.body.ad
      });
    });
});

module.exports = router;
