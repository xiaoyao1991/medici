module.exports = function(callback) {

  function initContract(contract){
    var publisher1 = "0x90f8bf6a479f320ead074411a4b0e7944ea8c9c1";
    var advertiser1 = "0xffcf8fdee72ac11b5c542428b35eef5769c409f0";
    contract.registerPublisher(publisher1);

    // var balance = web3.eth.getBalance(advertiser1);
    // console.log(balance);
    contract.deposit({from: advertiser1, value:100000})
    var rtv = contract.getDeposit({from:advertiser1})//.then(console.log);
    console.log(rtv.then(console.log))
    // contract.debugAdd().then(console.log)
    // contract.debug().then(console.log)
    //contract.depositTable(advertiser1,advertiser1).then(console.log)
  //  eth.sendTransaction({from: advertiser1, to: publisher1, value:200})
    // contract.bob().then(console.log)
    // contract.publisherList(0).then(console.log)
    // contract.publisherWeighting(0).then(console.log)
    // contract.test().then(console.log)


  }


  var ad = AdExchange.deployed();
  initContract(ad)



}
