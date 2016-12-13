module.exports = function(callback) {
  var transactionHash =  0x25616042b8cbbb1d8bf947034dc47cd6c14d7c666064d377e935bb8ef103f401;
  var transaction = web3.eth.getTransactionFromBlock("latest",0);
  console.log(transaction);
}
