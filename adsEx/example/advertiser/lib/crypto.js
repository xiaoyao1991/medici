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
    var vrs = utils.ecsign(new Buffer(soliditySha3(msg),"hex"), new Buffer(prvkey, "hex"));
    return utils.toRpcSig(vrs.v, vrs.r, vrs.s);
  },

  verify: function(pubkey, msg, rpcSig) {
    var vrs = utils.fromRpcSig(rpcSig);
    var pubaddr = utils.bufferToHex(utils.pubToAddress(utils.ecrecover(new Buffer(soliditySha3(msg),"hex"), vrs.v, vrs.r, vrs.s)));
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

// var sk = "cdb7c231505787c5072456b26375a65ef786b0aee5154fd6868c51b37e80cb03";
// var pk = "e76ecb9e897190c3b1617dbb1705d95445e84505";
// var vrs = crypto.sign(sk, "hello");
// var verified = crypto.verify(pk, "hello", vrs);
// console.log(verified);
