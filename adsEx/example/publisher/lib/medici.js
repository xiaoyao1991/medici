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
      source = _.replace(source, /_;/g, "_")
      source = _.replace(source, /payable/g, " ")
      source = _.join(source.split("\n").slice(1), "\n");
      var compiled = web3.eth.compile.solidity(source);
      var abi = compiled.info.abiDefinition;

      // web3.eth.defaultAccount = web3.eth.coinbase;

      // create contract
      var Medici = web3.eth.contract(abi);
      return Medici.at("0xa86110fd409404b8d190d867f1cc89a7e35624e4");
    },
    getCurrentBlock: function() {
      return web3.eth.blockNumber;
    }
};
