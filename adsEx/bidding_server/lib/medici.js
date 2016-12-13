module.exports = {
    init : function() {
      var Web3 = require("web3");
      var web3 = new Web3();
      web3.setProvider(new web3.providers.HttpProvider("http://localhost:8545"));

      // solidity code code
      var source = "" +
      "contract Test {\n" +
      "  function multiply(uint a) constant returns(uint d) {\n" +
      "    return a * 7;\n" +
      "  }\n" +
      "}\n";

      var compiled = web3.eth.compile.solidity(source);
      var abi = compiled.info.abiDefinition;

      // web3.eth.defaultAccount = web3.eth.coinbase;

      // create contract
      var Medici = web3.eth.contract(abi);
      var MediciInstance = Medici.at("0x6ea951d3380ccec0eccd14d482238c84bd270485");
      return MediciInstance;
    }
};
