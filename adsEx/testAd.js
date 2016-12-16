var crypto = require('./bidding_server/lib/crypto');
var utils = require('ethereumjs-util');
var SHA3 = require('keccakjs')
const leftPad = require('left-pad')

utilsha3 = function (a, bits) {
  a = utils.toBuffer(a)
  if (!bits) bits = 256

  var h = new SHA3(bits)
  if (a) {
    h.update(a)
  }
  return h.digest('hex');
}

function solSha3 (...args) {
    args = args.map(arg => {
        if (typeof arg === 'string') {
            if (arg.substring(0, 2) === '0x') {
                return arg.slice(2)
            } else {
                return web3.toHex(arg).slice(2)
            }
        }

        if (typeof arg === 'number') {
            return leftPad((arg).toString(16), 64, 0)
        } else {
          return ''
        }
    })
    args = args.join('')
    return web3.sha3(args, { encoding: 'hex' })
}

module.exports = function(callback) {

  function initContract(contract){
    var publisher1 = "0x90f8bf6a479f320ead074411a4b0e7944ea8c9c1";
    var publisher2 = "0xe11ba2b4d45eaed5996cd0823791e0c93114882d";
    var publisher3 = "0x22d491bde2303f2f43325b2108d26f1eaba1e32b";
    var advertiser1 = "0xffcf8fdee72ac11b5c542428b35eef5769c409f0";
    var advertiser2 = "0xd03ea8624c8c5987235048901fb614fdca89b117";
    var advertiser1sk = "6cbed15c793ce57650b9877cf6fa156fbef513c4e6134f022a85b1ffdd59b2a1";
    var advertiser2sk = "add53f9a7e588d003326d1cbf9e4a43c061aadd9bc938c843a79e7b4fd2ad743";
    // var shaDebugging = contract.debugSha();
    // shaDebugging.watch(function(err, result) {
    //   if (err) {
    //    console.log(err);
    //    return;
    //  }
    //  console.log("digest: " + result.args.digest + ", v: "+result.args.v+", r: "+result.args.r+", s: "+result.args.s);
    //  shaDebugging.stopWatching()
    // });
    var debugging = contract.debugging();
    debugging.watch(function(err, result) {
      if (err) {
       console.log(err);
       return;
     }
     console.log("address: " + result.args.sender + ", message:" + result.args.message + ", index:" + result.args.index);
     //debugging.stopWatching()
    });
    var debugHistory = contract.debugHistory();
    debugHistory.watch(function(err, result) {
      if (err) {
       console.log(err);
       return;
     }
     console.log("advertiser: " + result.args.advertiser + ", publisher:" + result.args.publisher + ", amount:" + result.args.withDrawAmount
      + ", eventId:" + result.args.eventId+ ", blockHeightAtBid:" + result.args.blockHeightAtBid+ ", bidId:" + result.args.bidId);
     //debugging.stopWatching()
    });

    //register 3 publishers and advertiser
    contract.registerPublisher({from: publisher1});
    contract.registerPublisher({from: publisher2});
    contract.registerPublisher({from: publisher3});
    var callback = "www.google.com";
    var vrs = utils.fromRpcSig(crypto.sign(advertiser1sk, callback));
    contract.registerAdvertiser(callback,vrs.v, utils.bufferToHex(vrs.r), utils.bufferToHex(vrs.s),{from:advertiser1});
    var callback2 = "www.baidu.com";
    var vrs2 = utils.fromRpcSig(crypto.sign(advertiser2sk, callback2));
    contract.registerAdvertiser(callback2,vrs2.v, utils.bufferToHex(vrs2.r), utils.bufferToHex(vrs2.s),{from:advertiser2});

    // contract.getAllPublisher();
    // contract.getAllAdvertise();


    var balance = web3.eth.getBalance(advertiser1);
    console.log("before deposit: "+ balance);
    contract.deposit({from:advertiser1,value:10000});
    contract.deposit({from:advertiser2,value:100});
    balance = web3.eth.getBalance(advertiser1);
    console.log("after deposit: "+ balance);
    console.log("-----------Deposit info for advertiser1("+advertiser1+")---------------" );
    contract.getDepositInfo(advertiser1);
    contract.setPublisherWeighting(1000,1500,1000);
    contract.getDepositInfo(advertiser1);
    // console.log("-----------Deposit info for advertiser1("+advertiser2+")---------------" );
    // contract.getDepositInfo(advertiser2);
    // contract.findAvailableAdvertisersByPublisher(publisher1,10000).then(console.log);

    //test withdraw
    // var receiverKey = publisher1;
    // var eventId = "secret";
    // var blockHeightAtBid = 1;
    // var bidId = 2;
    // var ads = "www.google.com/ads";
    // var amount = 20;
    // var paymentToken = [receiverKey, eventId, blockHeightAtBid, bidId, ads, amount];
    // //console.log(solSha3(receiverKey, eventId, blockHeightAtBid, bidId, ads, amount));
    // var vrsPayment = utils.fromRpcSig(crypto.sign(advertiser1sk, paymentToken));
    //
    // var balance = web3.eth.getBalance(publisher1);
    // console.log("before deposit: "+ balance);
    // // contract.checkTokenValidity(
    // //   advertiser1,
    // //   publisher1,
    // //   eventId,
    // //   blockHeightAtBid,
    // //   bidId,
    // //   ads,
    // //   amount,
    // //   vrsPayment.v,
    // //   utils.bufferToHex(vrsPayment.r),
    // //   utils.bufferToHex(vrsPayment.s)).then(console.log);
    // contract.withdraw(advertiser1,
    //   publisher1,
    //   eventId,
    //   blockHeightAtBid,
    //   bidId,
    //   ads,
    //   amount,
    //   vrsPayment.v,
    //   utils.bufferToHex(vrsPayment.r),
    //   utils.bufferToHex(vrsPayment.s),
    //   {from:publisher1})
    //   balance = web3.eth.getBalance(publisher1);
    //   console.log("after deposit: "+ balance);
    // contract.getWithDrawHistory()

    //console.log("local:\n" + "digest: 0x" + crypto.sha(paymentToken) + ", v: "+vrsPayment.v+", r: "+utils.bufferToHex(vrsPayment.r)+", s: "+utils.bufferToHex(vrsPayment.s))



  }


  var ad = AdExchange.deployed();
  initContract(ad)



}
