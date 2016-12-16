var utils = require('ethereumjs-util');
const leftPad = require('left-pad')
var Web3 = require("web3");
var web3;

var soliditySha3 = function(args) {
    web3 = new Web3();
    formatedArgs = []
    for (var i = 0, len = args.length; i < len; i++) {
      arg = args[i]
      if (typeof arg === 'string') {
          if (arg.substring(0, 2) === '0x') {
              formatedArgs.push(arg.slice(2))
          } else {
              formatedArgs.push(web3.toHex(arg).slice(2))
          }
      }
      if (typeof arg === 'number') {
          formatedArgs.push(leftPad((arg).toString(16), 64, 0))
      }
    }
    args = formatedArgs.join('')
    return web3.sha3(args, { encoding: 'hex' }).substr(2)
}
module.exports = {
  sign: function(prvkey, msg) {
    if (utils.isHexPrefixed(prvkey)) {
      prvkey = utils.stripHexPrefix(prvkey);
    }
    var vrs = utils.ecsign(utils.sha256(msg), new Buffer(prvkey, "hex"));
    return utils.toRpcSig(vrs.v, vrs.r, vrs.s);
  },

  verify: function(pubkey, msg, rpcSig) {
    var vrs = utils.fromRpcSig(rpcSig);
    var pubaddr = utils.bufferToHex(utils.pubToAddress(utils.ecrecover(utils.sha256(msg), vrs.v, vrs.r, vrs.s)));
    if (utils.isHexPrefixed(pubkey)) {
      return pubkey == pubaddr;
    } else {
      return pubkey == utils.stripHexPrefix(pubaddr);
    }
  },
  soliditySha3: function(msg){
    return soliditySha3(msg);
  }
};
