# Medici
-----
RTB Ad Exchange on Ethereum.

### Prerequisites
1. [testrpc](https://github.com/ethereumjs/testrpc)
1. [truffle](http://truffleframework.com/)

### Usage
1. Start testrpc
```
  testrpc \
  --account="0xcdb7c231505787c5072456b26375a65ef786b0aee5154fd6868c51b37e80cb03,10000000000000000000000" \
  --account="0xfe1e0d82f17d8f1cb9d367d1c9da658e3cec9e7c606e71002c1c6035795136e5,10000000000000000000000" \
  --account="0x7bf58b0dc30ba5e3335df25f6b4d6228687cfcfc9d4f6da450be15e2d2cd81c9,10000000000000000000000"
```
1. Deploy the smart contract: `$ truffle migrate --reset`
1. In a Node console, run
```
  var p0="0xe76ecb9e897190c3b1617dbb1705d95445e84505"
  var p1="0x212d78e23d62260fe5bb2d777c010abb9f915025"
  var p2="0xc17bc6209e102bf486c8937229f992fab3cd5273"

  var s0="0xcdb7c231505787c5072456b26375a65ef786b0aee5154fd6868c51b37e80cb03"
  var s1="0xfe1e0d82f17d8f1cb9d367d1c9da658e3cec9e7c606e71002c1c6035795136e5"
  var s2="0x7bf58b0dc30ba5e3335df25f6b4d6228687cfcfc9d4f6da450be15e2d2cd81c9"

  var mediciUtils = require('medici-js');
  var medici = mediciUtils.init('contracts/AdExchange.sol', '<contract deployed address>');
  var utils = require('ethereumjs-util');

  var sig = mediciUtils.sign(s0, ['http://localhost:4000'])
  var vrs = utils.fromRpcSig(sig)
  medici.registerAdvertiser("http://localhost:4000", vrs.v, utils.bufferToHex(vrs.r), utils.bufferToHex(vrs.s), {from: p0})

  sig = mediciUtils.sign(s1, ['http://localhost:5000'])
  vrs = utils.fromRpcSig(sig)
  medici.registerAdvertiser("http://localhost:5000", vrs.v, utils.bufferToHex(vrs.r), utils.bufferToHex(vrs.s), {from: p1})

  medici.registerPublisher({from: p2})

  medici.deposit({from: p0, value:100})
  medici.deposit({from: p1, value:100})
```
1. Link library package:  
```
  $ cd lib && npm link \
    && cd ../bidding_server && npm link medici-js \
    && cd ../example/advertiser && npm link medici-js \
    && cd ../publisher && npm link medici-js
```
1. Start offchain servers:  
  a. bidding server  
  `$ CONTRACT=../contracts/AdExchange.sol DEPLOYEDAT=<contract deployed address> npm start`  
  b. advertiser servers  
  `$ PORT=4000 SK=0xcdb7c231505787c5072456b26375a65ef786b0aee5154fd6868c51b37e80cb03 PK=0xe76ecb9e897190c3b1617dbb1705d95445e84505 BRAND=nike npm start`  
  `$ PORT=5000 SK=0xfe1e0d82f17d8f1cb9d367d1c9da658e3cec9e7c606e71002c1c6035795136e5 PK=0x212d78e23d62260fe5bb2d777c010abb9f915025 BRAND=adidas npm start`  
  c. publisher server  
  `$ PORT=4444 SK=0x7bf58b0dc30ba5e3335df25f6b4d6228687cfcfc9d4f6da450be15e2d2cd81c9 PK=0xc17bc6209e102bf486c8937229f992fab3cd5273 npm start`  
