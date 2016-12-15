var Web3 = require("web3");
var fs = require("fs");
var _ = require("lodash");
var web3;

module.exports = {
    init : function(solidity_src_file) {
      web3 = new Web3();
      web3.setProvider(new web3.providers.HttpProvider("http://localhost:8545"));

      // solidity code code
      var source = fs.readFileSync(solidity_src_file, 'utf8');
      source = _.replace(source, "_;", "_")
      source = _.join(source.split("\n").slice(1), "\n");
      console.log(source);
      var compiled = web3.eth.compile.solidity(source);
      var abi = compiled.info.abiDefinition;

      // web3.eth.defaultAccount = web3.eth.coinbase;

      // create contract
      var Medici = web3.eth.contract(abi);
      return Medici.at("0xbd09a57b705f3fb17c44d3f5460d6cb2e6b91bbd");
    },
    getCurrentBlock: function() {
      return web3.eth.blockNumber;
    }
};
