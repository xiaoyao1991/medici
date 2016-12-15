var crypto = require('./bidding_server/lib/crypto');
var utils = require('ethereumjs-util');

module.exports = function(callback) {

  function initContract(contract){
    var publisher1 = "0x90f8bf6a479f320ead074411a4b0e7944ea8c9c1";
    var publisher2 = "0xe11ba2b4d45eaed5996cd0823791e0c93114882d";
    var publisher3 = "0x22d491bde2303f2f43325b2108d26f1eaba1e32b";
    var advertiser1 = "0xffcf8fdee72ac11b5c542428b35eef5769c409f0";
    var advertiser1sk = "6cbed15c793ce57650b9877cf6fa156fbef513c4e6134f022a85b1ffdd59b2a1"
    var debugging = contract.debugging();
    debugging.watch(function(err, result) {
      if (err) {
       console.log(err);
       return;
     }
     console.log("address: " + result.args.sender + ", message:" + result.args.message + ", index:" + result.args.index);
     //debugging.stopWatching()
    });

    //register 3 publishers
    // contract.registerPublisher({from: publisher1});
    // contract.registerPublisher({from: publisher2});
    // contract.registerPublisher({from: publisher3});
    // contract.getAllPublisher();

    //register advertiser
    var callback = "www.google.com";
    var vrs = utils.fromRpcSig(crypto.sign(advertiser1sk, callback));
    // contract.getAllAdvertise();
  //  contract.registerAdvertiser(callback,vrs.v, utils.bufferToHex(vrs.r), utils.bufferToHex(vrs.s),{from:advertiser1});
    var balance = web3.eth.getBalance(advertiser1);
    console.log("before deposit: "+ balance);
    contract.deposit({from:advertiser1,value:10000});
    balance = web3.eth.getBalance(advertiser1);
    console.log("after deposit: "+ balance);
    contract.getDepositInfo(advertiser1);


    // contract.deposit({from: advertiser1, value:100000})
    // var rtv = contract.getDeposit({from:advertiser1})//.then(console.log);
    // console.log(rtv.then(console.log))
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
