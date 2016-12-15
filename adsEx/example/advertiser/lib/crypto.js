var utils = require('ethereumjs-util');

module.exports = {
  sign: function(prvkey, msg) {
    if (utils.isHexPrefixed(prvkey)) {
      prvkey = utils.stripHexPrefix(prvkey);
    }
    var vrs = utils.ecsign(utils.sha3(msg), new Buffer(prvkey, "hex"));
    return utils.toRpcSig(vrs.v, vrs.r, vrs.s);
  },

  verify: function(pubkey, msg, rpcSig) {
    var vrs = utils.fromRpcSig(rpcSig);
    var pubaddr = utils.bufferToHex(utils.pubToAddress(utils.ecrecover(utils.sha3(msg), vrs.v, vrs.r, vrs.s)));
    if (utils.isHexPrefixed(pubkey)) {
      return pubkey == pubaddr;
    } else {
      return pubkey == utils.stripHexPrefix(pubaddr);
    }
  }
};

// var sk = "cdb7c231505787c5072456b26375a65ef786b0aee5154fd6868c51b37e80cb03";
// var pk = "e76ecb9e897190c3b1617dbb1705d95445e84505";
// var vrs = crypto.sign(sk, "hello");
// var verified = crypto.verify(pk, "hello", vrs);
// console.log(verified);
