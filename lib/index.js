var Web3 = require("web3");
var utils = require('ethereumjs-util');
const leftPad = require('left-pad');
var fs = require("fs");
var _ = require("lodash");
var web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider("http://localhost:8545"));

module.exports = {
  init : function(solidity_src_file, deployed_address) {
    // solidity code code
    var source = fs.readFileSync(solidity_src_file, 'utf8');
    source = _.replace(source, /_;/g, "_");
    source = _.replace(source, /payable/g, " ");
    source = _.join(source.split("\n").slice(1), "\n");
    var compiled = web3.eth.compile.solidity(source);
    var abi = compiled.info.abiDefinition;

    // create contract
    var Medici = web3.eth.contract(abi);
    return Medici.at(deployed_address);
  },
  getCurrentBlock: function() {
    return web3.eth.blockNumber;
  },
  sign: function(prvkey, msg) {
    if (utils.isHexPrefixed(prvkey)) {
      prvkey = utils.stripHexPrefix(prvkey);
    }
    var vrs = utils.ecsign(new Buffer(this._soliditySha3(msg),"hex"), new Buffer(prvkey, "hex"));
    return utils.toRpcSig(vrs.v, vrs.r, vrs.s);
  },

  verify: function(pubkey, msg, rpcSig) {
    var vrs = utils.fromRpcSig(rpcSig);
    var pubaddr = utils.bufferToHex(utils.pubToAddress(utils.ecrecover(new Buffer(this._soliditySha3(msg),"hex"), vrs.v, vrs.r, vrs.s)));
    if (utils.isHexPrefixed(pubkey)) {
      return pubkey == pubaddr;
    } else {
      return pubkey == utils.stripHexPrefix(pubaddr);
    }
  },
  _soliditySha3: function(args) {
      var formatedArgs = [];
      for (var i = 0, len = args.length; i < len; i++) {
        arg = args[i];
        if (typeof arg === 'string') {
            if (arg.substring(0, 2) === '0x') {
                formatedArgs.push(arg.slice(2));
            } else {
                formatedArgs.push(web3.toHex(arg).slice(2));
            }
        }
        if (typeof arg === 'number') {
            formatedArgs.push(leftPad((arg).toString(16), 64, 0));
        }
      }
      args = formatedArgs.join('');
      return web3.sha3(args, { encoding: 'hex' }).substr(2);
  }
};
