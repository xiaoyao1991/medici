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
